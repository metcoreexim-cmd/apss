import { motion } from "framer-motion";
import { HelpCircle, Package, Truck, CreditCard, RotateCcw, User, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Orders & Products",
    icon: Package,
    faqs: [
      {
        question: "How do I place an order?",
        answer: "Browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account for faster future purchases and order tracking.",
      },
      {
        question: "Can I modify my order after placing it?",
        answer: "Order modifications are possible within 1 hour of placing the order. Please contact our support team immediately if you need to make changes.",
      },
      {
        question: "How do I check product availability?",
        answer: "Product availability is shown on each product page. If a product is out of stock, you can sign up for notifications to be alerted when it's back.",
      },
      {
        question: "Are the product images accurate?",
        answer: "We strive to display accurate product images. However, colors may vary slightly due to screen settings. Product descriptions contain detailed specifications.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: Truck,
    faqs: [
      {
        question: "What are the shipping charges?",
        answer: "We offer free shipping on orders above ₹499. For orders below ₹499, a flat shipping charge of ₹49 applies.",
      },
      {
        question: "How long does delivery take?",
        answer: "Standard delivery takes 3-7 business days depending on your location. Metro cities typically receive orders within 3-4 days.",
      },
      {
        question: "Do you deliver to my area?",
        answer: "We deliver to 25,000+ pin codes across India. Enter your pin code at checkout to check serviceability.",
      },
      {
        question: "How can I track my order?",
        answer: "Once shipped, you'll receive a tracking link via email and SMS. You can also track your order on our Track Order page using your order number.",
      },
    ],
  },
  {
    title: "Payment",
    icon: CreditCard,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Credit/Debit Cards, UPI, Net Banking, Wallets (Paytm, PhonePe, etc.), and Cash on Delivery (COD) for eligible pin codes.",
      },
      {
        question: "Is Cash on Delivery available?",
        answer: "Yes, COD is available for most pin codes. COD orders have a limit of ₹10,000. A small COD fee of ₹30 may apply.",
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. We use industry-standard SSL encryption and partner with trusted payment gateways. We never store your card details.",
      },
      {
        question: "Can I use multiple payment methods?",
        answer: "Currently, each order can only be paid using a single payment method. However, you can use coupons along with any payment method.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    faqs: [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unused products in original packaging. Some items like personalized products are non-returnable.",
      },
      {
        question: "How do I initiate a return?",
        answer: "Log in to your account, go to Orders, select the item, and click 'Return'. Follow the instructions to schedule a pickup.",
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. Bank processing may take additional 3-5 days.",
      },
      {
        question: "What if I received a damaged product?",
        answer: "Please report damaged products within 48 hours of delivery with photos. We'll arrange a free pickup and full refund or replacement.",
      },
    ],
  },
  {
    title: "Account & Support",
    icon: User,
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click on the user icon and select 'Sign Up'. You can register using your email or continue with Google for faster signup.",
      },
      {
        question: "I forgot my password. What do I do?",
        answer: "Click 'Forgot Password' on the login page. We'll send a password reset link to your registered email address.",
      },
      {
        question: "How do I update my account details?",
        answer: "Log in and go to 'My Account'. You can update your profile, addresses, and communication preferences from there.",
      },
      {
        question: "How can I contact customer support?",
        answer: "You can reach us via WhatsApp (click the chat button), email at support@appsstore.com, or call us at +91 1234 567 890.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, returns, and more
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.title}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </StoreLayout>
  );
}
