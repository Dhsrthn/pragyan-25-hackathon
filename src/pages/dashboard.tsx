import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';

const array = [1, 2, 3, 4]

function Dashboard() {
    const [opened, { open, close }] = useDisclosure(false);
    return (<>
        <Modal opened={opened} onClose={close}>
            Hello, this is centered modal
        </Modal>
        <div className='h-screen w-screen overflow-hidden'>
            <div className="h-[10%]"></div>
            <div className='h-[90%] w-full px-56 overflow-auto pt-4'>

                {/* <div>
                    <Button onClick={open} color='violet'>Open centered Modal</Button>
                </div> */}

                {/* List of properties */}
                <div className="w-full h-[80%] flex flex-col justify-start gap-4 items-center">
                    {array.map((item) => {
                        return (
                            <div className="w-full border border-gray-300 flex justify-between rounded-lg items-center px-5 py-1">
                                {/* Property Name */}
                                <span className="font-bold text-2xl">Property {item}</span>
                                {/* Buttons */}
                                <div>

                                    <button color="#007a00" className='bg-[#007a00] px-4 py-1 rounded-lg text-white hover:bg-white hover:text-black hover: border-2 hover:border-[#007a00] hover:cursor-pointer ' onClick={open}>Buy</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    </>)
}

export default Dashboard;