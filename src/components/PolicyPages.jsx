import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageLayout = ({ title, children }) => (
  <div className="max-w-4xl mx-auto py-12 px-6">
    <Link to="/" className="inline-flex items-center text-green-700 hover:text-green-900 mb-6 font-medium">
      <ArrowLeft size={16} className="mr-2" /> Back to Home
    </Link>
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-800 to-emerald-700 py-8 px-10">
        <h1 className="text-3xl font-extrabold text-white">{title}</h1>
      </div>
      <div className="p-10 text-gray-700 space-y-6 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export const ContactUs = () => (
  <PageLayout title="Contact Us">
    <p>If you have any questions or queries regarding the application portal, please feel free to reach out to us.</p>
    
    <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Army Public School</h3>
      <div className="space-y-3">
        <p><strong>Address:</strong> Old Cantt, Prayagraj, Uttar Pradesh, India</p>
        <p><strong>Email:</strong> armyschoololdcant@gmail.com </p>
        <p><strong>Phone:</strong> +91-8299-129733 </p>
      </div>
    </div>
  </PageLayout>
);

export const TermsConditions = () => (
  <PageLayout title="Terms & Conditions">
    <p className="font-medium text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
    
    <h3 className="text-xl font-bold text-gray-900">1. Introduction</h3>
    <p>Welcome to the Army Public School, Old Cantt, Prayagraj Teacher Recruitment Application Portal. By using this portal, you agree to these Terms and Conditions.</p>

    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Application Process</h3>
    <p>Candidates must provide accurate and truthful information. Any discrepancy may lead to immediate disqualification of the application.</p>

    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Application Fee</h3>
    <p>A non-refundable application fee of ₹250 INR is charged for processing your application. This fee is mandatory for the successful submission of the form.</p>

    <h3 className="text-xl font-bold text-gray-900 mt-6">4. Intellectual Property</h3>
    <p>All content on this website is the property of Army Public School, Prayagraj and is protected by copyright laws.</p>
  </PageLayout>
);

export const RefundsCancellations = () => (
  <PageLayout title="Refunds & Cancellations">
    <p className="font-medium text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
    
    <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-6">
      <h3 className="text-red-800 font-bold text-lg mb-2">No Refund Policy</h3>
      <p className="text-red-700">The application fee of ₹250 INR is strictly non-refundable under any circumstances.</p>
    </div>

    <h3 className="text-xl font-bold text-gray-900 mt-6">1. Cancellations</h3>
    <p>Once an application form is submitted and the payment is successful, the application cannot be cancelled or withdrawn. The fee paid will not be returned.</p>

    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Failed Transactions</h3>
    <p>If your money is deducted from your bank account but the application status does not show as 'Paid', the amount is typically reversed by your bank within 5-7 business days. Please do not pay again immediately if you suspect a network issue.</p>

    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Duplicate Payments</h3>
    <p>In the rare event of a duplicate payment for the same application ID due to a technical error, the extra amount will be refunded upon verification. You must contact our support team within 7 days of the transaction.</p>
  </PageLayout>
);
