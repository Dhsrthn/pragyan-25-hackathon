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
                            <div className="w-full border flex justify-between rounded-lg items-center px-5 py-1">
                                {/* Property Name */}
                                <span className="font-bold text-2xl">Property {item}</span>
                                {/* Buttons */}
                                <div>

                                    <Button color="#007a00" onClick={open}>Buy</Button>
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