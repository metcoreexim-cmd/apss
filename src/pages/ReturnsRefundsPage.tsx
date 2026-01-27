import { motion } from "framer-motion";
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, CreditCard } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const returnSteps = [
  {
    step: 1,
    title: "Initiate Return",
    description: "Log in to your account and go to Orders. Select the item and click 'Return'.",
  },
  {
    step: 2,
    title: "Pack the Item",
    description: "Pack the product in its original packaging with all tags and accessories.",
  },
  {
    step: 3,
    title: "Schedule Pickup",
    description: "Choose a convenient time for our courier partner to pick up the item.",
  },
  {
    step: 4,
    title: "Get Refund",
    description: "Once received and inspected, refund will be processed within 5-7 business days.",
  },
];

const eligibleItems = [
  "Unused products in original packaging",
  "Products with all tags attached",
  "Items returned within 7 days of delivery",
  "Defective or damaged products (report within 48 hours)",
  "Wrong product delivered",
];

const nonEligibleItems = [
  "Used or damaged products (by customer)",
  "Products without original packaging or tags",
  "Items returned after 7 days",
  "Customized or personalized products",
  "Gift cards and vouchers",
  "Products marked as non-returnable",
];

export default function ReturnPolicyPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Returns & Refunds
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hassle-free returns with our customer-friendly policy
          </p>
        </motion.div>

        {/* Return Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center h-full border-primary/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">7 Days</h3>
                <p className="text-muted-foreground">Easy Return Window</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center h-full border-primary/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">5-7 Days</h3>
                <p className="text-muted-foreground">Refund Processing</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center h-full border-primary/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">100%</h3>
                <p className="text-muted-foreground">Money Back Guarantee</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>How to Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {returnSteps.map((step, index) => (
                  <div key={step.step} className="relative">
                    {index < returnSteps.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-muted -translate-x-1/2" />
                    )}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold relative z-10">
                        {step.step}
                      </div>
                      <h4 className="font-semibold mb-2">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Eligibility */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Eligible for Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Not Eligible for Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {nonEligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Refund Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Refund Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4>Refund Timeline</h4>
                  <ul className="text-sm">
                    <li><strong>Inspection:</strong> 1-2 business days after pickup</li>
                    <li><strong>Refund Initiation:</strong> Within 24 hours of approval</li>
                    <li><strong>Bank Processing:</strong> 5-7 business days</li>
                  </ul>
                </div>
                <div>
                  <h4>Refund Method</h4>
                  <ul className="text-sm">
                    <li><strong>Online Payments:</strong> Refund to original payment method</li>
                    <li><strong>COD Orders:</strong> Bank transfer or store credit</li>
                    <li><strong>Partial Returns:</strong> Proportional refund</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </StoreLayout>
  );
}
