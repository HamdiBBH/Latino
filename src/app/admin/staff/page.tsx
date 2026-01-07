"use client";

import { useState } from "react";
import { Users, Plus, Shield, Mail, Trash2, Check, X, UserCheck, UserX } from "lucide-react";

interface Employee {
    id: string;
    name: string;
    email: string;
    role: "MANAGER" | "RESTAURANT" | "CLIENT";
    phone: string;
    active: boolean;
    createdAt: string;
}

const initialEmployees: Employee[] = [
    { id: "1", name: "Sophie Martin", email: "sophie@latinocoucou.com", role: "MANAGER", phone: "+216 98 123 456", active: true, createdAt: "2024-01-15" },
    { id: "2", name: "Karim Ben Ali", email: "karim@latinocoucou.com", role: "RESTAURANT", phone: "+216 97 654 321", active: true, createdAt: "2024-02-20" },
    { id: "3", name: "Leila Trabelsi", email: "leila@latinocoucou.com", role: "RESTAURANT", phone: "+216 99 111 222", active: true, createdAt: "2024-03-10" },
    { id: "4", name: "Ahmed Hamdi", email: "ahmed@latinocoucou.com", role: "MANAGER", phone: "+216 96 333 444", active: false, createdAt: "2024-01-05" },
];

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
    MANAGER: { label: "Manager", color: "#166534", bg: "#DCFCE7" },
    RESTAURANT: { label: "Staff Resto/Cuisine", color: "#92400E", bg: "#FEF3C7" },
    CLIENT: { label: "Client", color: "#374151", bg: "#F3F4F6" },
};

export default function StaffPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        email: "",
        phone: "",
        role: "RESTAURANT" as "MANAGER" | "RESTAURANT" | "CLIENT",
    });

    const toggleActive = (id: string) => {
        setEmployees(employees.map(e =>
            e.id === id ? { ...e, active: !e.active } : e
        ));
    };

    const deleteEmployee = (id: string) => {
        setEmployees(employees.filter(e => e.id !== id));
    };

    const addEmployee = () => {
        if (newEmployee.name && newEmployee.email) {
            setEmployees([...employees, {
                id: Date.now().toString(),
                ...newEmployee,
                active: true,
                createdAt: new Date().toISOString().split("T")[0],
            }]);
            setNewEmployee({ name: "", email: "", phone: "", role: "RESTAURANT" });
            setShowAddForm(false);
        }
    };

    const activeCount = employees.filter(e => e.active).length;
    const managerCount = employees.filter(e => e.role === "MANAGER" && e.active).length;
    const staffCount = employees.filter(e => e.role === "RESTAURANT" && e.active).length;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                        <Users style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Équipe RH
                        </h1>
                    </div>
                    <p style={{ color: "#7A7A7A" }}>
                        Gérez les comptes employés et leurs accès
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#E8A87C",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "100px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Plus style={{ width: 20, height: 20 }} />
                    Ajouter un employé
                </button>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                }}
            >
                {[
                    { label: "Total Actifs", value: activeCount, color: "#22C55E" },
                    { label: "Managers", value: managerCount, color: "#3B82F6" },
                    { label: "Staff Resto", value: staffCount, color: "#F97316" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            backgroundColor: "#FFFFFF",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                            border: "1px solid #E5E7EB",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ color: "#7A7A7A", fontSize: "0.875rem" }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                        marginBottom: "2rem",
                    }}
                >
                    <h3 style={{ fontWeight: 600, color: "#222222", marginBottom: "1rem" }}>Nouvel employé</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Nom complet"
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <input
                            type="tel"
                            placeholder="Téléphone"
                            value={newEmployee.phone}
                            onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        />
                        <select
                            value={newEmployee.role}
                            onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as "MANAGER" | "RESTAURANT" })}
                            style={{ padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "1rem" }}
                        >
                            <option value="RESTAURANT">Staff Resto/Cuisine</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button
                            onClick={addEmployee}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 20px",
                                backgroundColor: "#22C55E",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Check style={{ width: 16, height: 16 }} />
                            Créer le compte
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "10px 20px",
                                backgroundColor: "#F3F4F6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <X style={{ width: 16, height: 16 }} />
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Employees List */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                }}
            >
                {employees.map((employee, index) => {
                    const roleInfo = roleLabels[employee.role];
                    return (
                        <div
                            key={employee.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1.25rem 1.5rem",
                                borderBottom: index < employees.length - 1 ? "1px solid #E5E7EB" : "none",
                                opacity: employee.active ? 1 : 0.5,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: employee.active ? "#E8A87C" : "#9CA3AF",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#FFFFFF",
                                        fontWeight: 600,
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    {employee.name.charAt(0)}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: "#222222" }}>{employee.name}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                        <Mail style={{ width: 14, height: 14, color: "#9CA3AF" }} />
                                        <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{employee.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 12px",
                                        backgroundColor: roleInfo.bg,
                                        color: roleInfo.color,
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        borderRadius: "100px",
                                    }}
                                >
                                    <Shield style={{ width: 12, height: 12 }} />
                                    {roleInfo.label}
                                </span>

                                <button
                                    onClick={() => toggleActive(employee.id)}
                                    style={{
                                        padding: "8px",
                                        backgroundColor: employee.active ? "#DCFCE7" : "#FEE2E2",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: employee.active ? "#166534" : "#B91C1C",
                                    }}
                                    title={employee.active ? "Désactiver" : "Activer"}
                                >
                                    {employee.active ? <UserCheck style={{ width: 16, height: 16 }} /> : <UserX style={{ width: 16, height: 16 }} />}
                                </button>

                                <button
                                    onClick={() => deleteEmployee(employee.id)}
                                    style={{
                                        padding: "8px",
                                        backgroundColor: "#FEE2E2",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "#B91C1C",
                                    }}
                                    title="Supprimer"
                                >
                                    <Trash2 style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
