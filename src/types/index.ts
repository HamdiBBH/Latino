// ==========================================
// Database Types
// ==========================================

export type UserRole = 'DEV' | 'CLIENT' | 'RESTAURANT' | 'MANAGER' | 'ADMIN';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    loyalty_points: number;
    created_at: string;
}

export interface SiteContent {
    id: string;
    key: string;
    value: ContentValue;
    section: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContentValue {
    text: string;
    type: 'heading' | 'paragraph' | 'button' | 'label';
    metadata?: Record<string, unknown>;
}

export interface SiteBranding {
    id: string;
    key: string;
    value: string;
    type: 'color' | 'font' | 'url' | 'text';
    created_at: string;
    updated_at: string;
}

export interface Reservation {
    id: string;
    user_id: string | null;
    type: 'table' | 'transat' | 'vip' | 'event';
    date: string;
    time: string;
    guests: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    special_requests: string | null;
    created_at: string;
    // Joined data
    profile?: Profile;
}

export interface Order {
    id: string;
    reservation_id: string | null;
    items: OrderItem[];
    status: 'new' | 'preparing' | 'ready' | 'served' | 'paid';
    total_amount: number;
    created_at: string;
    updated_at: string;
    // Joined data
    reservation?: Reservation;
}

export interface OrderItem {
    menu_item_id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    available: boolean;
}

export interface Package {
    id: string;
    name: string;
    price: number;
    features: PackageFeature[];
    style: 'white' | 'gold' | 'light';
    sort_order: number;
}

export interface PackageFeature {
    icon: string;
    text: string;
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    date: string;
    start_time: string | null;
    end_time: string | null;
    image_url: string | null;
    featured: boolean;
}

export interface Testimonial {
    id: string;
    author_name: string;
    author_location: string | null;
    author_image_url: string | null;
    content: string;
    rating: number;
    visible: boolean;
}

export interface GalleryImage {
    id: string;
    url: string;
    caption: string | null;
    size: 'normal' | 'large' | 'wide';
    sort_order: number;
}

// ==========================================
// Form Types
// ==========================================

export interface BookingFormData {
    type: 'table' | 'transat' | 'vip' | 'event';
    date: string;
    time: string;
    guests: number;
    name?: string;
    email?: string;
    phone?: string;
    special_requests?: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

// ==========================================
// Component Props Types
// ==========================================

export interface DynamicTextProps {
    contentKey: string;
    fallback?: string;
    className?: string;
    as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

export interface DynamicImageProps {
    bucket: string;
    path: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
}
