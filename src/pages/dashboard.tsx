//@ts-nocheck
import { useDisclosure } from "@mantine/hooks";
import { Modal, NumberInput, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "@mantine/form";
import { RandomLoader } from "../components/loader/randomLoader";
import { addProperty, getAllProperties } from "../utils/helper";
import { ethers } from "ethers";
import { abi } from "./abi";

enum ModalMode {
  Information,
  AddElement,
}
interface Plot {
  id: number;
  name: string;
  imageUrl: string;
  location: string;
  area: number;
  price: number;
  owner?: string;
  isROWApproved?: boolean;
}

function Dashboard() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loader, setLoader] = useState(false);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [modalMode, setModalMode] = useState(ModalMode.Information);

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const contractAddress = "0x9FAE5cC2957985C3361E29f2426F3242E27F603b";

        const contract: any = new ethers.Contract(contractAddress, abi, signer);

        setContract(contract);
        setProvider(provider);
      } else {
        console.error("Metamask is not installed");
      }
    };
    if (provider) loadProvider();
  }, []);

  useEffect(() => {
    if (!contract) return;

    const fetchProperties = async () => {
      try {
        const properties = await getAllProperties(contract);
        const formattedPlots: Plot[] = properties.map((prop, index) => ({
          id: index + 1,
          name: prop.propertyName,
          imageUrl: prop[7], // imageURL from the array
          location: prop.location,
          area: prop.area.toNumber(),
          price: prop.price.toNumber(),
          owner: prop.owner,
          isROWApproved: prop.isROWApproved,
        }));
        setPlots(formattedPlots);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to fetch properties");
      }
    };

    fetchProperties();
  }, [contract]);

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

  const handleAddProperty = async (values) => {
    if (!contract) {
      toast.error("Blockchain contract not initialized");
      return;
    }
    close();

    try {
      setLoader(true);
      const tx = await addProperty(
        values.name,
        values.location,
        values.area,
        values.price,
        values.imageUrl,
        contract
      );
      // await tx.wait();

      toast.success("Property added successfully");
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property");
    } finally {
      setLoader(false);
    }
  };

  const handleBuyPlot = async () => {
    if (!contract || !selectedPlot) {
      toast.error("Cannot process transaction");
      return;
    }

    try {
      setLoader(true);
      // Implement contract method to buy property
      // This is a placeholder - you'll need to replace with actual contract method
      // const tx = await contract.buyProperty(selectedPlot.id);
      // await tx.wait();

      close();
    } catch (error) {
      console.error("Error buying property:", error);
      toast.error("Failed to buy property");
    } finally {
      setTimeout(() => {
        toast.success("Property purchase request sent");
        setLoader(false);
      }, 3200);
    }
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
