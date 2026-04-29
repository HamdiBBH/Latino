-- Durable public rate limits and defensive reservation constraints.

CREATE TABLE IF NOT EXISTS public.public_rate_limits (
    key text PRIMARY KEY,
    request_count integer NOT NULL DEFAULT 0,
    reset_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.public_rate_limits FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.check_public_rate_limit(
    rate_key text,
    max_requests integer,
    window_seconds integer
)
RETURNS TABLE (
    allowed boolean,
    remaining integer,
    reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_bucket public.public_rate_limits%ROWTYPE;
    next_reset timestamptz := now() + make_interval(secs => window_seconds);
BEGIN
    DELETE FROM public.public_rate_limits
    WHERE public_rate_limits.reset_at <= now() - interval '1 hour';

    SELECT *
    INTO current_bucket
    FROM public.public_rate_limits
    WHERE public_rate_limits.key = rate_key
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.public_rate_limits(key, request_count, reset_at)
        VALUES (rate_key, 1, next_reset);

        RETURN QUERY SELECT true, greatest(max_requests - 1, 0), next_reset;
        RETURN;
    END IF;

    IF current_bucket.reset_at <= now() THEN
        UPDATE public.public_rate_limits
        SET request_count = 1,
            reset_at = next_reset,
            updated_at = now()
        WHERE public_rate_limits.key = rate_key;

        RETURN QUERY SELECT true, greatest(max_requests - 1, 0), next_reset;
        RETURN;
    END IF;

    IF current_bucket.request_count >= max_requests THEN
        RETURN QUERY SELECT false, 0, current_bucket.reset_at;
        RETURN;
    END IF;

    UPDATE public.public_rate_limits
    SET request_count = current_bucket.request_count + 1,
        updated_at = now()
    WHERE public_rate_limits.key = rate_key;

    RETURN QUERY SELECT true, greatest(max_requests - current_bucket.request_count - 1, 0), current_bucket.reset_at;
END;
$$;

REVOKE ALL ON FUNCTION public.check_public_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_public_rate_limit(text, integer, integer) TO anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservations_guest_count_range'
    ) THEN
        ALTER TABLE public.reservations
        ADD CONSTRAINT reservations_guest_count_range
        CHECK (guest_count BETWEEN 1 AND 15) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservations_email_format'
    ) THEN
        ALTER TABLE public.reservations
        ADD CONSTRAINT reservations_email_format
        CHECK (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservations_phone_format'
    ) THEN
        ALTER TABLE public.reservations
        ADD CONSTRAINT reservations_phone_format
        CHECK (guest_phone ~ '^\+?[0-9]{8,15}$') NOT VALID;
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_public_rate_limits_reset_at
ON public.public_rate_limits(reset_at);

CREATE INDEX IF NOT EXISTS idx_reservations_date_status
ON public.reservations(reservation_date, status);
