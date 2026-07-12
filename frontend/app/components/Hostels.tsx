"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Hostels() {
    const [hostelName, setHostelName] = useState("");
    const [hostelFloors, setHostelFloors] = useState("");
    const [hostelAddress, setHostelAddress] = useState("");
    const [allHostels, setAllHostels] = useState([]);
    const router = useRouter();

    // function called when we wanna add hostel 
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
        fetchHostels();
    }

    async function handleDeleteHostel(id: number) {
        console.log("delete handler")
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/deletehostel/${id}`);
        if (!response.ok) return;
        console.log("fetching after deleting");
        fetchHostels();
    }

    // hostel data getting api function 
    async function fetchHostels() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/hostels`);
        if (!response.ok) return;
        const data = await response.json();
        setAllHostels(data.hostels);
    }

    // This effecct is called when application starts and save data comming from database to allHostels state and show below
    useEffect(() => {
        fetchHostels();
    }, []);


    return (
        <div className="p-8">
            {/* Add Hostel section */}
            <form className="flex flex-col gap-2 w-1/2 mx-auto" onSubmit={handleAddHostel}>
                <input
                    type="text"
                    placeholder="Enter Hostel Name"
                    className="border rounded-md p-2 text-black"
                    required
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Enter Total Floors"
                    className="border rounded-md p-2 text-black"
                    required
                    min={1}
                    value={hostelFloors}
                    onChange={(e) => setHostelFloors(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter Address"
                    className="border rounded-md p-2 text-black"
                    required
                    value={hostelAddress}
                    onChange={(e) => setHostelAddress(e.target.value)}
                />
                <button className="bg-green-700 text-white font-medium border rounded-md p-2" type="submit">
                    Add Hostel
                </button>
            </form>

            {/* Hostel Card are shown here */}
            <div className="mt-8 w-1/2 mx-auto">
                <h2 className="text-xl font-bold mb-4 text-black">All Hostels</h2>
                {/* map to show all hostel below  */}
                {allHostels && allHostels.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {allHostels.map((hostel: any) => (
                            <div key={hostel.id} className="border rounded-md p-4 bg-white shadow-sm flex flex-col gap-1 text-black" onClick={() => router.push(`/rooms?hostelId=${hostel.id}`)}>
                                <div className="flex justify-end">
                                    <button className="bg-red-700 text-white font-medium border rounded-md p-2" onClick={(e) => { e.stopPropagation(); handleDeleteHostel(hostel.id) }}>
                                        Delete Hostel
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold">{hostel.hostelName}</h3>
                                <p className="text-sm text-gray-600">Floors: {hostel.hostelFloors}</p>
                                <p className="text-sm text-gray-600">Address: {hostel.hostelAddress}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hostels found.</p>
                )}
            </div>

        </div>
    );
}