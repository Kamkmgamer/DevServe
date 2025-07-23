import Container from "../components/layout/Container";
import { ContactForm } from "../components/form/ContactForm";
import { motion } from "framer-motion";

const ContactPage = () => (
  <Container className="py-16 flex justify-center">
    <motion.div
      className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Contact Us
      </motion.h1>

      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        We'd love to hear from you. Please fill out the form below and we’ll get in touch.
      </p>

      <ContactForm />
    </motion.div>
  </Container>
);

export default ContactPage;
