//@ts-nocheck
import { useDisclosure } from "@mantine/hooks";
import { Modal, NumberInput, TextInput } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "@mantine/form";
import { RandomLoader } from "../components/loader/randomLoader";

const initialPlots = [
  {
    id: 1,
    name: "Property 1",
    imageUrl: "/assets/images/buildings/image1.jpg",
    location: "New York",
    area: 1000,
    price: 500000,
  },
  {
    id: 2,
    name: "Property 2",
    imageUrl: "/assets/images/buildings/image2.jpg",
    location: "Los Angeles",
    area: 1500,
    price: 750000,
  },
  {
    id: 3,
    name: "Property 3",
    imageUrl: "/assets/images/buildings/image3.jpeg",
    location: "Chicago",
    area: 800,
    price: 400000,
  },
  {
    id: 4,
    name: "Property 4",
    imageUrl: "/assets/images/buildings/image4.jpg",
    location: "Houston",
    area: 1200,
    price: 600000,
  },
];

enum ModalMode {
  Information,
  AddElement,
}

function Dashboard() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loader, setLoader] = useState(false);
  const [plots, setPlots] = useState(initialPlots);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [modalMode, setModalMode] = useState(ModalMode.Information);

  const form = useForm({
    initialValues: {
      name: "",
      imageUrl: "",
      location: "",
      area: 0,
      price: 0,
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      imageUrl: (value) => (!value.startsWith("http") ? "Invalid URL" : null),
      area: (value) => (value <= 0 ? "Area must be positive" : null),
      price: (value) => (value < 0 ? "Price cannot be negative" : null),
    },
  });

  const openInformationModal = (plot) => {
    setSelectedPlot(plot);
    setModalMode(ModalMode.Information);
    open();
  };

  const openAddElementModal = () => {
    setSelectedPlot(null);
    setModalMode(ModalMode.AddElement);
    open();
  };

  const handleAddProperty = (values) => {
    const newProperty = {
      ...values,
      id: plots.length + 1,
    };
    setPlots([...plots, newProperty]);
    close();
  };

  const handleBuyPlot = () => {
    setLoader(true);
    close();
    setTimeout(() => {
      toast.success("Request sent successfully");
      setLoader(false);
      close();
    }, 3200);
  };

  return (
    <>
      {loader && (
        <div className="w-screen h-screen bg-[#00000087] absolute flex justify-center items-center z-50">
          <RandomLoader />
        </div>
      )}

      <Modal.Root opened={opened} onClose={close}>
        <Modal.Overlay backgroundOpacity={0.55} blur={3} />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title className="text-4xl font-bold text-redd">
              {modalMode === ModalMode.Information
                ? "Plot Information"
                : "Add Element"}
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            {modalMode === ModalMode.Information && selectedPlot && (
              <div>
                <h2>{selectedPlot.name}</h2>
                <img
                  src={selectedPlot.imageUrl}
                  alt={selectedPlot.name}
                  className="w-full h-64 object-cover mb-4"
                />
                <p>
                  <strong>Location:</strong> {selectedPlot.location}
                </p>
                <p>
                  <strong>Area:</strong> {selectedPlot.area} sq ft
                </p>
                <p>
                  <strong>Price:</strong> ${selectedPlot.price.toLocaleString()}
                </p>
                <button
                  onClick={handleBuyPlot}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Buy Plot
                </button>
              </div>
            )}
            {modalMode === ModalMode.AddElement && (
              <form onSubmit={form.onSubmit(handleAddProperty)}>
                <TextInput
                  label="Name"
                  placeholder="Enter property name"
                  {...form.getInputProps("name")}
                  withAsterisk
                />
                <TextInput
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                  {...form.getInputProps("imageUrl")}
                  mt="md"
                />
                <TextInput
                  label="Location"
                  placeholder="Enter location"
                  {...form.getInputProps("location")}
                  mt="md"
                />
                <NumberInput
                  label="Area"
                  placeholder="Enter area"
                  {...form.getInputProps("area")}
                  mt="md"
                  suffix=" sq ft"
                />
                <NumberInput
                  label="Price"
                  placeholder="Enter price"
                  {...form.getInputProps("price")}
                  mt="md"
                  prefix="$"
                />
                <button
                  type="submit"
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Property
                </button>
              </form>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <div className="h-screen w-screen overflow-hidden">
        <div className="h-[10%]"></div>
        <div className="h-[90%] w-full px-56 overflow-auto pt-4">
          <div className="w-full h-[80%] flex flex-wrap justify-center gap-8 items-start p-2">
            {plots.map((plot) => (
              <div key={plot.id} className="w-56 h-60 bg-black">
                <div className="w-full h-60 bg-white flex flex-col justify-around items-center border">
                  <span className="font-bold text-2xl h-12 py-2">
                    {plot.name}
                  </span>
                  <img
                    src={plot.imageUrl}
                    alt={plot.name}
                    className="h-32 object-contain"
                  />
                  <div className="h-12 py-2">
                    <div className="bg-black">
                      <button
                        className="px-10 py-1 hover:-translate-x-2 -translate-x-1 -translate-y-1 hover:-translate-y-2 transition-all hover:border-2 bg-[#007a00] text-white hover:text-[#007a00] hover:bg-white hover:border-[#007a00] font-semibold hover:cursor-pointer"
                        onClick={() => openInformationModal(plot)}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed right-10 bottom-10 text-[#007a00]">
          <img
            src="./assets/plus.svg"
            alt=""
            className="size-20 hover:cursor-pointer"
            onClick={openAddElementModal}
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
