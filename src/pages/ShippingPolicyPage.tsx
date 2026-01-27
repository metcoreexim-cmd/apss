import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Package, Shield, HelpCircle } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const shippingInfo = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on all orders above ₹499",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "3-7 business days delivery across India",
  },
  {
    icon: MapPin,
    title: "Pan India Coverage",
    description: "We deliver to 25,000+ pin codes",
  },
  {
    icon: Package,
    title: "Secure Packaging",
    description: "Products are carefully packed to prevent damage",
  },
];

const faqItems = [
  {
    question: "What are the shipping charges?",
    answer: "We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping charge of ₹49 is applicable.",
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive orders within 3-4 days, while other areas may take 5-7 days.",
  },
  {
    question: "Do you offer express delivery?",
    answer: "Yes, we offer express delivery for select pin codes. Express delivery typically takes 1-2 business days and costs ₹99 extra.",
  },
  {
    question: "Can I track my order?",
    answer: "Yes! Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our Track Order page.",
  },
  {
    question: "What if my area is not serviceable?",
    answer: "We deliver to most pin codes across India. If your pin code is not serviceable by our courier partners, we'll notify you at checkout.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. International shipping will be available soon.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shipping Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fast, reliable, and secure delivery to your doorstep
          </p>
        </motion.div>

        {/* Shipping Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {shippingInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Policy */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <h4>Delivery Timeline</h4>
                <ul>
                  <li><strong>Metro Cities:</strong> 3-4 business days</li>
                  <li><strong>Tier 2 Cities:</strong> 4-5 business days</li>
                  <li><strong>Other Areas:</strong> 5-7 business days</li>
                  <li><strong>Remote Areas:</strong> 7-10 business days</li>
                </ul>

                <h4>Shipping Charges</h4>
                <ul>
                  <li>Orders above ₹499: <strong>FREE Shipping</strong></li>
                  <li>Orders below ₹499: ₹49 flat rate</li>
                  <li>Express Delivery: Additional ₹99</li>
                </ul>

                <h4>Order Processing</h4>
                <p>
                  Orders placed before 2 PM on business days are usually dispatched the same day. 
                  Orders placed after 2 PM or on weekends/holidays will be processed on the next business day.
                </p>

                <h4>Packaging</h4>
                <p>
                  All products are carefully packed in protective packaging to ensure they reach you in perfect condition. 
                  Fragile items receive additional cushioning and protection.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </StoreLayout>
  );
}
