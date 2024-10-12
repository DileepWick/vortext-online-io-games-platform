import React, { useState, useEffect } from "react";
import axios from "axios";

// Components
import Header from "../src/components/header";
import Footer from "../src/components/footer";
import ChatModal from "../src/components/ChatModal";

// Utilities
import useAuthCheck from "../src/utils/authCheck";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";

// NextUI Components
import {
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

// Icons
import { PlusIcon } from "../src/assets/icons/PlusIcon";
import DownloadIcon from "../src/assets/icons/DownloadIcon";

// Notifications
import { Flip, toast } from "react-toastify";
import CustomToast from "../src/components/CustomToast";
import "react-toastify/dist/ReactToastify.css";

// Document Head Management
import { Helmet } from "react-helmet-async";
import ScrollToTop from "../src/components/ScrollToTop";

const ContactDash = () => {
  useAuthCheck("Support Agent");
  // State for active tab
  const [activeTab, setActiveTab] = useState("tab1");

  // State for FAQs
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for contact messages
  const [contactMessages, setContactMessages] = useState([]);
  const [contact, setContact] = useState([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Filter function for FAQs
  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter function for Contact Messages
  const filteredContactMessages = contactMessages.filter(
    (message) =>
      (message.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.messages[0]?.content
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || message.status === statusFilter)
  );

  // Function to handle chat opening
  const handleChatOpen = (contactId) => {
    setSelectedContactId(contactId);
    setIsChatOpen(true);
  };

  // Status color mapping
  const statusColorMap = {
    open: "success",
    closed: "danger",
  };

  // FAQ modal state
  const {
    isOpen: isAddFAQOpen,
    onOpen: onAddFAQOpen,
    onOpenChange: onAddFAQOpenChange,
  } = useDisclosure();

  const {
    isOpen: isEditFAQOpen,
    onOpen: onEditFAQOpen,
    onOpenChange: onEditFAQOpenChange,
  } = useDisclosure();

  // State for adding/editing FAQs
  const [newFAQQuestion, setNewFAQQuestion] = useState("");
  const [newFAQAnswer, setNewFAQAnswer] = useState("");
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [editFAQQuestion, setEditFAQQuestion] = useState("");
  const [editFAQAnswer, setEditFAQAnswer] = useState("");

  useEffect(() => {
    // Function to fetch FAQs and contact messages
    const fetchData = async () => {
      try {
        // Make concurrent API calls to fetch FAQs and contact messages
        const [faqResponse, contactResponse] = await Promise.all([
          axios.get("http://localhost:8098/faq/fetchFAQ"),
          axios.get("http://localhost:8098/contacts/fetchContacts"),
        ]);

        // Check if FAQ response contains data and update state
        if (faqResponse.data && faqResponse.data.allFAQs) {
          setFaqs(faqResponse.data.allFAQs);
        } else {
          setFaqs([]); // Set FAQs to empty array if no data found
        }

        // Check if contact response contains data and update state
        if (contactResponse.data && contactResponse.data.allContacts) {
          setContactMessages(contactResponse.data.allContacts);
        } else {
          setContactMessages([]); // Set contact messages to empty array if no data found
        }
      } catch (err) {
        // Handle errors and update state
        setError("Failed to fetch data");
        setFaqs([]); // Reset FAQs on error
        setContactMessages([]); // Reset contact messages on error
      } finally {
        setLoading(false); // Set loading to false after data fetch is complete
      }
    };

    // Call fetchData function when component mounts
    fetchData();
  }, []);

  // Function to generate and download a report
  const GenerateReportButton = async () => {
    try {
      // Make a GET request to the backend API to generate the report
      const timestamp = new Date().getTime(); // Get current timestamp for cache-busting
      const response = await axios.get(
        `http://localhost:8098/contacts/generateReport?t=${timestamp}`,
        {
          responseType: "blob", // Specify that we expect a binary response
        }
      );

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url; // Set the link's href to the blob URL
      link.setAttribute("download", "support_report.pdf"); // Set the desired file name
      document.body.appendChild(link); // Append the link to the document
      link.click(); // Programmatically click the link to start the download
      link.remove(); // Remove the link from the document

      // Clean up the URL object after the download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error); // Log the error to the console
      // Optionally, show an error message to the user
    }
  };

  // Function to handle adding a new FAQ
  const handleAddFAQ = async () => {
    // Check if either the question or answer fields are empty
    if (!newFAQQuestion.trim() || !newFAQAnswer.trim()) {
      // Show error toast when fields are empty
      CustomToast({
        message: "Both Question and Answer fields are required",
        type: "error",
      });
      return; // Stop the submission if the fields are empty
    }

    try {
      // Make a POST request to add the new FAQ
      const response = await axios.post("http://localhost:8098/faq/createFAQ", {
        question: newFAQQuestion,
        answer: newFAQAnswer,
      });

      console.log("Response:", response);

      // Check if the response is successful and contains the new FAQ
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data.faq
      ) {
        // Update the FAQs state with the new FAQ
        setFaqs((prevFaqs) => [...prevFaqs, response.data.faq]);

        // Show success toast
        CustomToast({
          message: "FAQ Added",
          type: "success",
        });
      }

      // Clear input fields and close modal
      setNewFAQQuestion("");
      setNewFAQAnswer("");
      onAddFAQOpenChange(false);
    } catch (error) {
      // Log error to console and update error state
      console.error("Error adding FAQ:", error);
      setError("Failed to add FAQ");

      // Show error toast
      CustomToast({
        message: "Failed to add FAQ",
        type: "error",
      });
    }
  };

  // Function to handle updating an FAQ
  const handleUpdateFAQ = async () => {
    // Check if the current question and answer are different from the original
    if (
      editFAQQuestion.trim() === editingFAQ.question.trim() &&
      editFAQAnswer.trim() === editingFAQ.answer.trim()
    ) {
      // Show error toast when there are no changes
      CustomToast({
        message: "No changes made",
        type: "error",
      });
      return; // Stop submission if no changes are made
    }

    // Check if either the question or answer fields are empty
    if (editFAQQuestion.trim() === "" || editFAQAnswer.trim() === "") {
      // Show error toast when fields are empty
      CustomToast({
        message: "Both Question and Answer fields cannot be empty",
        type: "error",
      });
      return; // Stop the submission if the fields are empty
    }

    try {
      // Make a PUT request to update the FAQ by its ID
      const response = await axios.put(
        `http://localhost:8098/faq/updateFAQ/${editingFAQ._id}`,
        {
          question: editFAQQuestion,
          answer: editFAQAnswer,
        }
      );

      console.log("Response Data:", response.data);

      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        console.log("Updated FAQ Data:", response.data);

        if (response.data.faq) {
          // Update the FAQ in the state with the new data
          setFaqs((prevFaqs) =>
            prevFaqs.map((faq) =>
              faq._id === response.data.faq._id ? response.data.faq : faq
            )
          );

          // Show success toast after FAQ is updated
          CustomToast({
            message: "FAQ Updated",
            type: "success",
          });
        }
      }

      // Clear the input fields and reset the editing state
      setEditFAQQuestion("");
      setEditFAQAnswer("");
      setEditingFAQ(null);
      onEditFAQOpenChange(false); // Close the edit FAQ modal
    } catch (error) {
      console.error("Error updating FAQ:", error);
      setError("Failed to update FAQ");

      // Show error toast in case of failure
      CustomToast({
        message: "Failed to update FAQ",
        type: "error",
      });
    }
  };

  // Function to handle updating the status of a contact/ticket
  const handleUpdateStatus = async (contactId) => {
    try {
      setLoading(true); // Start loading

      // Make a PUT request to update the status of the contact by its ID
      const response = await axios.put(
        `http://localhost:8098/contacts/setStatus/${contactId}`,
        { status: "closed" }
      );

      console.log("Response:", response); // Debug: Check response

      // Ensure the response is successful
      if (response.status >= 200 && response.status < 300) {
        console.log("Status successfully updated to closed:", response.data);

        // Update the contact status in the state
        setContact((prevContact) => ({
          ...prevContact,
          status: "closed",
        }));

        // Show success message
        CustomToast({
          message: "Ticket Closed",
          type: "success",
        });
      } else {
        console.error("Failed to update status:", response);
      }
    } catch (error) {
      console.error("Error updating status:", error); // Log error

      // Show error toast
      CustomToast({
        message: "Failed to close the ticket",
        type: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to handle deleting an FAQ
  const handleDeleteFAQ = async (faqId) => {
    try {
      // Make a DELETE request to the backend to delete the FAQ by its ID
      await axios.delete(`http://localhost:8098/faq/deleteFAQ/${faqId}`);

      // Filter the FAQs and remove the deleted FAQ from the state
      setFaqs(faqs.filter((faq) => faq._id !== faqId));

      // Show success toast after the FAQ is deleted
      CustomToast({
        message: "FAQ Deleted",
        type: "success",
      });
    } catch {
      // Set error state in case the deletion fails
      setError("Failed to delete FAQ.");

      // Show error toast if the FAQ deletion fails
      CustomToast({
        message: "Failed to delete FAQ.",
        type: "error",
      });
    }
  };

  // Function to handle deleting a contact message (ticket)
  const handleDeleteMessage = async (messageId) => {
    try {
      // Find the contact in the contactMessages array using the message ID
      const contactToDelete = contactMessages.find(
        (contact) => contact._id === messageId
      );

      // Check if the contact exists, otherwise throw an error
      if (!contactToDelete) {
        throw new Error("Contact not found");
      }

      // Check if the contact's status is "open"; if so, prevent deletion
      if (contactToDelete.status === "open") {
        CustomToast({
          message: "Cannot delete an open ticket", // Show error toast for open tickets
          type: "error",
        });
        return; // Stop further execution if the ticket is still open
      }

      // If the ticket is not open, proceed with deletion
      await axios.delete(
        `http://localhost:8098/contacts/deleteContact/${messageId}`
      );

      // Remove the deleted contact message from the state
      setContactMessages(
        contactMessages.filter((message) => message._id !== messageId)
      );

      // Show success toast after the ticket is deleted
      CustomToast({
        message: "Ticket deleted",
        type: "success",
      });
    } catch (error) {
      // Set error state in case the deletion fails
      setError("Failed to delete message.");

      // Show error toast in case of failure, using the error message if available
      CustomToast({
        message: error.message || "Failed to delete ticket",
        type: "error",
      });
    }
  };

  return (
    <div>
      <Header />
      <ScrollToTop />
      <div className="flex w-full flex-col dark text-foreground bg-background">
        <div className="flex items-center p-4 font-primaryRegular">
          <Tabs
            aria-label="Blogger Tabs"
            className="flex-1"
            onSelectionChange={setActiveTab}
            selectedKey={activeTab}
            size="lg"
            color="primary"
          >
            <Tab key="FAQ" title="FAQ" />
            <Tab key="ContactUs" title="Contact Messages" />
          </Tabs>
          <div className="p-4">
            <Input
              className="mb-4"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Button onClick={GenerateReportButton}>
              <DownloadIcon />
              Generate Report
            </Button>
          </div>
        </div>
        <div className="p-4">
          {activeTab === "FAQ" && (
            <div>
              <Helmet>
                <title>FAQ | Support Dashboard</title>
              </Helmet>
              <Button
                className="bg-primary text-foreground mb-4"
                onPress={onAddFAQOpen}
              >
                <PlusIcon />
                Add FAQ
              </Button>
              <Modal
                isOpen={isAddFAQOpen}
                onOpenChange={onAddFAQOpenChange}
                className="dark text-foreground bg-background"
                size="3xl"
                backdrop="blur"
                isDismissable={false}
                isKeyboardDismissDisabled={false}
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                    exit: {
                      y: -20,
                      opacity: 0,
                      transition: {
                        duration: 0.2,
                        ease: "easeIn",
                      },
                    },
                  },
                }}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Add New FAQ
                      </ModalHeader>
                      <ModalBody>
                        <Input
                          label="Question"
                          placeholder="Enter the question"
                          value={newFAQQuestion}
                          onChange={(e) => setNewFAQQuestion(e.target.value)}
                          fullWidth
                        />
                        <Textarea
                          label="Answer"
                          placeholder="Enter the answer"
                          value={newFAQAnswer}
                          onChange={(e) => setNewFAQAnswer(e.target.value)}
                          fullWidth
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleAddFAQ}>
                          Add FAQ
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              <Modal
                isOpen={isEditFAQOpen}
                onOpenChange={onEditFAQOpenChange}
                className="dark text-foreground bg-background"
                size="3xl"
                backdrop="blur"
                isDismissable={false}
                isKeyboardDismissDisabled={false}
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                    exit: {
                      y: -20,
                      opacity: 0,
                      transition: {
                        duration: 0.2,
                        ease: "easeIn",
                      },
                    },
                  },
                }}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Edit FAQ
                      </ModalHeader>
                      <ModalBody>
                        <Input
                          label="Question"
                          placeholder="Enter the question"
                          value={editFAQQuestion}
                          onChange={(e) => setEditFAQQuestion(e.target.value)}
                          fullWidth
                        />
                        <Textarea
                          label="Answer"
                          placeholder="Enter the answer"
                          value={editFAQAnswer}
                          onChange={(e) => setEditFAQAnswer(e.target.value)}
                          fullWidth
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleUpdateFAQ}>
                          Update FAQ
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              {loading ? (
                <Spinner />
              ) : error ? (
                <p className="text-red-500 text-center">Error: {error}</p>
              ) : faqs.length === 0 ? (
                <p className="text-center text-gray-400">
                  {searchQuery
                    ? "No FAQs match your search"
                    : "No FAQs available"}
                </p>
              ) : (
                <Table aria-label="FAQ Table" className="mt-4">
                  <TableHeader className="bg-foreground">
                    <TableColumn>QUESTION</TableColumn>
                    <TableColumn>ANSWER</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredFAQs.map((faq) => (
                      <TableRow key={faq._id}>
                        <TableCell width={350}>{faq.question}</TableCell>
                        <TableCell>{faq.answer}</TableCell>
                        <TableCell width={220}>
                          <Button
                            color="primary"
                            className="mr-2"
                            onPress={() => {
                              setEditingFAQ(faq);
                              setEditFAQQuestion(faq.question);
                              setEditFAQAnswer(faq.answer);
                              onEditFAQOpen();
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            color="danger"
                            onPress={() => handleDeleteFAQ(faq._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          {activeTab === "ContactUs" && (
            <div>
              <Helmet>
                <title>Contact | Support Dashboard</title>
              </Helmet>
              <Dropdown className="bg-foreground">
                <DropdownTrigger>
                  <Button className="mb-4">
                    Filter by Status:{" "}
                    {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Status filter"
                  onAction={(key) => setStatusFilter(key)}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="open">Open</DropdownItem>
                  <DropdownItem key="closed">Closed</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              {loading ? (
                <Spinner />
              ) : error ? (
                <p className="text-red-500 text-center">Error: {error}</p>
              ) : contactMessages.length === 0 ? (
                <p className="text-center text-gray-400">
                  {searchQuery || statusFilter !== "all"
                    ? "No messages match your search or filter criteria"
                    : "No messages available"}
                </p>
              ) : (
                <Table aria-label="Contact Messages Table" className="mt-4">
                  <TableHeader className="bg-foreground">
                    <TableColumn>USERNAME</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>MESSAGE</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredContactMessages.map((contact) => (
                      <TableRow key={contact._id}>
                        <TableCell>{contact.username}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          {contact.messages[0]?.content.length > 50
                            ? `${contact.messages[0].content.substring(
                                0,
                                50
                              )}...`
                            : contact.messages[0]?.content ||
                              "No message content"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={statusColorMap[contact.status]}
                            className="capitalize"
                            variant="flat"
                          >
                            {contact.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button
                            color="danger"
                            className="mr-2"
                            onPress={() => handleDeleteMessage(contact._id)}
                          >
                            Delete
                          </Button>
                          <Button
                            color="success"
                            className="mr-2"
                            onPress={() => {
                              handleChatOpen(contact._id);
                            }}
                          >
                            {contact.status === "closed" ? "View" : "Reply"}
                          </Button>
                          <Button
                            color="primary"
                            className="mr-2"
                            onClick={() => handleUpdateStatus(contact._id)}
                            isDisabled={contact.status === "closed"}
                          >
                            {contact.status === "closed" ? "Closed" : "Close"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <ChatModal
                isOpen={isChatOpen}
                onOpenChange={() => setIsChatOpen(false)}
                contactId={selectedContactId}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactDash;
