import React from "react";

const ProfilePage = () => {
  return (
    <div className="p-4">
      <h1 className="mt-10 text-3xl font-bold mb-2">Customize Your Profile</h1>
      <p>Let your teammates know who you are!</p>
        <div className="bg-gray-200 rounded-2xl p-8 mt-6">
            <h3 className="text-m font-semibold mb-4">Your Profile</h3>
        
            <div className="flex items-start gap-8 mt-6">
            <div className="w-32 h-32 aspect-square bg-gray-400 rounded-full flex items-center justify-center shrink-0">

            </div>
            <div>
                <h3 className="text-m font-semibold">Profile Photo</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Upload a photo so that your teammates can recognize you!
                </p>

                <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100">
                    Upload a Photo
                </button>

            </div>
            </div>

        <h3 className="text-base font-semibold mt-14 mb-0">Name</h3>
        <input
            type="text"
            className="w-46/100 mt-2 px-4 py-1 border border-gray-300 rounded-lg bg-white focus:outline-non focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-gray-600 text-sm mb-4">
            Your name or nickname
        </p>


        <div className="flex gap-6 mt-7">
            <div className="flex-1">
                <h3 className="text-base font-semibold mb-0">Major/Program</h3>
                <input
                type="text"
                className="w-full mt-2 px-4 py-1 border border-gray-300 rounded-lg bg-white focus:outline-non focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="flex-1">
                <h3 className="text-base font-semibold mb-0">Year</h3>
                <input
                type="text"
                className="w-full mt-2 px-4 py-1 border border-gray-300 rounded-lg bg-white focus:outline-non focus:ring-2 focus:ring-blue-400"
                />
            </div>

        
        </div>



        </div>
    </div>
  );
};

export default ProfilePage;
