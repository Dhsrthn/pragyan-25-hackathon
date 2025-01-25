import { useState, useEffect, useCallback } from "react";

const MouseFollower: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        requestAnimationFrame(() => {
            setPosition({ x: e.clientX, y: e.clientY });
        });
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleMouseMove]);

    return (
        <div
            className="mouse-follower fixed rounded-[50%] h-[20rem] w-[20rem] z-[-5]"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
        >
            <div
                className="h-full -translate-x-[50%] -translate-y-[50%] rounded-[50%] w-full border top-[50%] left-[50%] bg-gradient-to-r"
                style={{
                    animation: "rotate 20s infinite",
                    background:
                        "linear-gradient(to right, aquamarine, #3D00B770)",
                    filter: "blur(100px)",
                }}
                id="blobl"
            ></div>
        </div>
    );
};


function Home() {
    return (<>
        <div className="h-screen w-screen overflow-hidden">
            <MouseFollower />
            <div className="w-full flex h-full border-b">
                <div className="h-full w-3/5 flex items-center justify-end">
                    <div className="h-[70%] flex flex-col w-[80%] text-left items-start justify-evenly  ">
                        <span className="text-7xl  font-integralHeavy font-bold text-left tracking-tighter">
                            Revolutionizing Property Transparency
                        </span>
                        <span className="text-xl font-dmsans text-left text-[#565656] tracking-wide">
                            One stop digital marketplace for data.
                            <br />
                            Store, sell, gain insights and
                            <br />
                            train models securely.
                        </span>
                        <button
                            className="h-[10%] w-1/4 rounded-[2rem] hover:border-2 bg-[#007a00] text-white hover:text-[#007a00] hover:bg-white hover:border-[#007a00] font-semibold text-xl hover:cursor-pointer"
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