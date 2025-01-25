import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Group } from '@mantine/core';

function Map() {
    const [opened, { open, close }] = useDisclosure(false);
    return (<>
        <Modal opened={opened} onClose={close}>
            Hello, this is centered modal
        </Modal>
        <div className='border h-screen w-screen overflow-hidden'>
            <div className="h-[10%]"></div>
            <div className="h-[90%] w-full">
                <Group>
                    <Button onClick={open} color='#007a00' >Open centered Modal</Button>
                </Group>
            </div>
        </div>
    </>)
}

export default Map;