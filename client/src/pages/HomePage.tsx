import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ChevronDown, Code, Palette, Zap, ArrowRight, Play, Globe, Smartphone, Shield, ExternalLink, Calendar } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

// Assuming these components are now in their own files
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import toast from 'react-hot-toast'; // Using react-hot-toast

// Animated Counter Component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState<number>(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true }); // Trigger animation only once

  useEffect(() => {
    if (isInView) {
      let startTime: number | undefined;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
    >
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.3 }}
        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg"
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Stats Section Component
const StatsSection = () => {
  const stats = [
    { label: "Projects Completed", value: 150, suffix: "+" },
    { label: "Happy Clients", value: 98, suffix: "%" },
    { label: "Years Experience", value: 5, suffix: "+" },
    { label: "Technologies", value: 25, suffix: "+" }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
    >
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.section>
  );
};

// Main HomePage Component
const HomePage: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const navigate = useNavigate();

  const features = [
    { icon: Code, title: "Custom Development", description: "Tailored web applications built with cutting-edge technologies like React and Node.js to meet your specific business needs." },
    { icon: Palette, title: "UI/UX Design", description: "Beautiful, intuitive interfaces designed with user experience at the forefront, ensuring an engaging and seamless journey." },
    { icon: Zap, title: "Performance Optimization", description: "Lightning-fast websites optimized for speed, SEO, and conversions. Every millisecond counts in today's digital landscape." },
    { icon: Smartphone, title: "Mobile-First Design", description: "Responsive designs that look and work perfectly on all devices, from smartphones to desktop computers." },
    { icon: Shield, title: "Security & Reliability", description: "Robust security measures and reliable hosting solutions to keep your website safe and always accessible." },
    { icon: Globe, title: "SEO Optimization", description: "Built-in SEO best practices to help your website rank higher in search engines and attract more organic traffic." }
  ];

  return (
    <div className="bg-slate-50 dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <motion.section style={{ y: y1, opacity }} className="relative py-20 md:py-32 min-h-screen flex items-center">
        <Container className="text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 mb-8">
              ✨ Available for new projects
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500">Modern Web</span>
              <br />
              <span className="text-gray-900 dark:text-white">Solutions</span>
            </h1>
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Transform your digital presence with stunning, high-performance websites and applications. From concept to deployment, I create experiences that captivate users and drive results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link to="/services">
                <Button variant="primary" className="group">
                  Explore Services
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://portfolio-delta-ruby-48.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="group">
                  <Play className="mr-2 w-4 h-4" />
                  View My Work
                </Button>
              </a>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Discover more</p>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </motion.section>

      <StatsSection />

      <section className="py-20 bg-white dark:bg-gray-900">
        <Container>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              What I Offer
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive web development services tailored to your business needs, from initial concept to ongoing maintenance and support.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={index * 0.1} />
            ))}
          </div>
        </Container>
      </section>

      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Container className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's collaborate to bring your vision to life with cutting-edge technology and thoughtful design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              {/* 👇 CORRECTED USAGE 👇 */}
              <Button variant="cta-light">
                Get Started Today
              </Button>
            </Link>
            {/* Example for an external link like Calendly */}
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              {/* 👇 CORRECTED USAGE 👇 */}
              <Button variant="cta-ghost">
                <Calendar className="mr-2 w-4 h-4" />
                Schedule a Call
              </Button>
            </a>
          </div>
        </Container>
      </motion.section>
    </div>
  );
};

export default HomePage;