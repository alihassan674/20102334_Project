import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import AddHostelModal from "~/components/AddHostelModal";

export default function Dashboard() {
    const [isAddHostelModalOpen, setIsAddHostelModalOpen] = useState(false);

    return (
        <div>
            <Header />
            <main className="p-4">
                <div>
                    <button
                        onClick={() => setIsAddHostelModalOpen(true)}
                        className="flex justify-center items-center gap-1 bg-[#00868D] hover:bg-[#00757B] rounded-sm px-4 py-2 text-white font-medium transition-colors cursor-pointer"
                    >
                        <FaPlus /> <span>Add Hostel</span>
                    </button>
                </div>
            </main>

            <AddHostelModal
                isOpen={isAddHostelModalOpen}
                onClose={() => setIsAddHostelModalOpen(false)}
            />

        </div>
    );
}

function Header() {
    return (
        <nav className="w-full bg-[#362421] p-4">
            <div className="text-2xl font-bold text-white ">Lodgely</div>
        </nav>
    );
}
