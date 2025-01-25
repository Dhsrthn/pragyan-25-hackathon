
function Home() {
    return (<>
        <div className="h-screen w-screen  overflow-hidden">

            <div className="w-full flex h-full border-b">
                <div className="h-full w-3/5 flex items-center justify-end">
                    <div className="h-[70%] flex flex-col w-[80%] text-left items-start justify-evenly  ">
                        <span className="text-4xl  font-integralHeavy font-bold text-left tracking-tighter">
                            OWN, CONTROL AND MONETIZE
                            <br />
                            YOUR DATA
                        </span>
                        <span className="text-xl font-dmsans text-left text-[#565656] tracking-wide">
                            One stop digital marketplace for data.
                            <br />
                            Store, sell, gain insights and
                            <br />
                            train models securely.
                        </span>
                        <button
                            className="h-[10%] w-1/4 rounded-[2rem] hover:border-2 bg-[#3D00B7] text-white hover:text-[#3D00B7] hover:bg-white hover:border-[#3D00B7] font-semibold text-xl hover:cursor-pointer"
                            onClick={() => {
                                window.location.href = "/dashboard"
                            }}
                        >
                            Explore now
                        </button>
                        <div className="h-[10%] w-[50%]  flex justify-around">

                        </div>
                    </div>
                </div>
                <div className="h-full w-2/5 flex items-center justify-start">
                    <div className="h-[50%] w-[80%] flex items-center">
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default Home;