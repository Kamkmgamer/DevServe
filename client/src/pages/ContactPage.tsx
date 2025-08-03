import Container from "../components/layout/Container";
import { ContactForm } from "../components/form/ContactForm";
import { motion } from "framer-motion";

const ContactPage = () => (
  <div className="bg-slate-50 dark:bg-slate-950">
    <Container className="py-16 flex justify-center">
      <motion.div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="mb-2 text-center text-4xl font-bold text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Contact Us
        </motion.h1>

        <p className="mb-8 text-center text-slate-600 dark:text-slate-400">
          We'd love to hear from you. Please fill out the form below and we’ll
          get in touch.
        </p>

        <ContactForm />
      </motion.div>
    </Container>
  </div>
);

export default ContactPage;