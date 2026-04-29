-- Public availability endpoint without exposing reservation PII.
-- Returns only aggregated guest counts for pending/confirmed reservations.

CREATE OR REPLACE FUNCTION public.get_public_reservation_capacity(
    start_date date,
    end_date date
)
RETURNS TABLE (
    reservation_date date,
    guest_count integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        r.reservation_date,
        COALESCE(SUM(r.guest_count), 0)::integer AS guest_count
    FROM public.reservations r
    WHERE r.reservation_date >= start_date
      AND r.reservation_date <= end_date
      AND r.status IN ('pending', 'confirmed')
    GROUP BY r.reservation_date
    ORDER BY r.reservation_date;
$$;

REVOKE ALL ON FUNCTION public.get_public_reservation_capacity(date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_reservation_capacity(date, date) TO anon, authenticated;
