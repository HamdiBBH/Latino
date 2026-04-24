import { getMenuItems } from "@/app/actions/cms";
import ClientMenu from "./ClientMenu";

export const metadata = {
    title: "Le Menu - Coucou Beach",
};

export const dynamic = "force-dynamic";

export default async function ClientMenuPage() {
    // Fetch all menu items from the database
    const items = await getMenuItems();

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", color: "#222" }}>Notre Menu</h1>
                <p style={{ color: "#6B7280", margin: 0 }}>Découvrez nos plats et boissons pour votre journée parfaite.</p>
            </div>
            
            <ClientMenu items={items || []} />
        </div>
    );
}
