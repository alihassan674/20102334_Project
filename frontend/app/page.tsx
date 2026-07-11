export default function Home() {
  return (
    <div>

      {/* Header */}
      <div className="text-center bg-blue-900">
        <h1 className="text-2xl font-bold ">Lodgely</h1>
        <p>Hostel Management System</p>
      </div>

      {/* body content */}
      <div className="p-8">
        {/* Add Hostel section */}
        <form className="flex flex-col gap-2 w-1/2 mx-auto">
          <input type="text" placeholder="Enter Hostel Name" className="border rounded-md p-2" required />
          <input type="number" placeholder="Enter Total Floors" className="border rounded-md p-2" required min={1} />
          <input type="email" placeholder="Enter email" className="border rounded-md p-2" required />
          <button className="bg-green-700 text-white font-medium border rounded-md p-2">Add Hostel</button>
        </form>


        {/* Hostel cards */}
        <div>

        </div>




      </div>
    </div >
  );
}
