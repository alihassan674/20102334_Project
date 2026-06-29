import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaXmark } from "react-icons/fa6";
import { useStore } from "~/store/store";

interface FormData {
  name: string;
}

const initialFormState: FormData = {
  name: "",
}

export default function AddHostelModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const addHostel = useStore((state) => state.addHostel);
  const [formData, setFormData] = useState<FormData>(initialFormState);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function submitHandle(e: FormEvent) {
    e.preventDefault();
    addHostel(formData.name);
    setFormData(initialFormState);
    onClose();
  }

  if (!isOpen) return;

  return <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center" >
    <div className=" relative w-full bg-[#362421] max-w-[620px] p-8 rounded-2xl" >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium tracking-wide">Add Hostel</h2>
        <button type="button" onClick={onClose} className="cursor-pointer" aria-label="close button" title="Close">
          <FaXmark className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={submitHandle} className="flex flex-col items-start mt-6">
        <input type="text" placeholder="Name of Hostel" className="w-full h-[62px] bg-[#111111] rounded-[10px] p-4" name="name" required onChange={handleChange} value={formData.name} />

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className=" font-medium text-base py-3 rounded-lg  cursor-pointer bg-[#00868D] hover:bg-[#00757B] px-12"
          >
            Save
          </button>
        </div>
      </form>

    </div>
  </div >
}