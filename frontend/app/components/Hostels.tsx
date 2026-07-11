"use client";
import { useState } from "react";

export default function Hostels() {
    const [hostelName, setHostelName] = useState("");
    const [hostelFloors, setHostelFloors] = useState("");
    const [hostelAddress, setHostelAddress] = useState("");

    async function handleAddHostel(e: React.FormEvent) {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        const response = await fetch(`${backendUrl}/api/addhostel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hostelName,
                hostelFloors,
                hostelAddress,
            }),
        });
        const data = await response.json();
        console.log(data);
    }
    return (
        <div className="p-8">
            {/* Add Hostel section */}
            <form className="flex flex-col gap-2 w-1/2 mx-auto" onSubmit={handleAddHostel}>
                <input
                    type="text"
                    placeholder="Enter Hostel Name"
                    className="border rounded-md p-2"
                    required
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Enter Total Floors"
                    className="border rounded-md p-2 "
                    required
                    min={1}
                    value={hostelFloors}
                    onChange={(e) => setHostelFloors(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter Address"
                    className="border rounded-md p-2 "
                    required
                    value={hostelAddress}
                    onChange={(e) => setHostelAddress(e.target.value)}
                />
                <button className="bg-green-700 text-white font-medium border rounded-md p-2" type="submit">
                    Add Hostel
                </button>
            </form>

        </div>
    );
}