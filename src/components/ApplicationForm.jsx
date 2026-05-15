import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UploadCloud, CheckCircle, AlertCircle, Save, CreditCard, ArrowRight, Printer, Download } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const qualifications = [
  { id: 'highSchool', label: 'High School' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'professional', label: 'B.Ed/B.El.Ed/D.El.Ed./B.P. Ed/M.Ed/M.P.Ed./ Professional Qualification' },
  { id: 'postGraduation', label: 'Post Graduation' },
  { id: 'anyOther', label: 'Any Other Qualification' },
];

const InputField = ({ label, name, type = 'text', required = false, showAsterisk = false, register, errors }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {(required || showAsterisk) && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      {...register(name, { required })}
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
    />
    {errors[name] && <span className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={12} className="mr-1"/> Required field</span>}
  </div>
);

const SelectField = ({ label, name, options, required = false, showAsterisk = false, register, errors }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {(required || showAsterisk) && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, { required })}
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
    >
      <option value="">Choose your option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {errors[name] && <span className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={12} className="mr-1"/> Required field</span>}
  </div>
);

export default function ApplicationForm({ userData }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      mobNo: '',
      emailId: userData?.email || '',
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0); // 0: form, 1: payment, 2: success
  const [cashfree, setCashfree] = useState(null);
  const [generatedAppId, setGeneratedAppId] = useState('');

  // Initialize Cashfree
  React.useEffect(() => {
    if (window.Cashfree) {
      const cf = new window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || "sandbox",
      });
      setCashfree(cf);
    }
  }, []);

  const teachingType = watch("teachingType");
  const hasExperience = watch("hasExperience");
  const armyDependent = watch("armyDependent");
  const csbStatus = watch("csb");
  const ctetStatus = watch("ctet");

  const handlePayment = async () => {
    if (!cashfree) {
      alert("Payment gateway not loaded. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Initiating payment session for App ID:", generatedAppId);
      
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_amount: 250,
          order_id: `ORDER_${generatedAppId}_${Date.now().toString().slice(-4)}`,
          customer_id: userData?.uid || `cust_${Date.now()}`,
          customer_phone: watch("mobNo"),
          customer_name: watch("name"),
          customer_email: watch("emailId"),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      console.log("Order created successfully:", data);

      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal", 
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.error("Payment error:", result.error);
          alert(result.error.message);
        }
        
        if (!result.error) {
          console.log("Payment successful or modal closed. Updating Firestore...");
          try {
            // Update document status to Paid
            await updateDoc(doc(db, "applications", generatedAppId), {
              status: "Paid",
              paymentId: data.order_id,
              paidAt: serverTimestamp()
            });
            console.log("Firestore updated with Paid status");
            setFormStep(2);
          } catch (updateErr) {
            console.error("Error updating payment status:", updateErr);
            // Still move to success step but log the error
            setFormStep(2);
          }
        }
      });

    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed to initialize: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file, path) => {
    if (!file || !(file instanceof File)) return null;
    const storageRef = ref(storage, `applications/${Date.now()}_${path}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const onSubmit = async (data) => {
    console.log("=== SUBMIT START ===");
    setIsSubmitting(true);
    try {
      // Generate a clean Application ID
      const newAppId = `APS-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
      setGeneratedAppId(newAppId);
      
      const cleanData = {};
      
      // Handle file uploads and clean data
      for (const key of Object.keys(data)) {
        const value = data[key];
        if (value && (value instanceof FileList || (typeof File !== 'undefined' && value instanceof File))) {
          const file = value instanceof FileList ? value[0] : value;
          if (file) {
            console.log(`Uploading ${key}: ${file.name}...`);
            try {
              const url = await uploadFile(file, key);
              cleanData[key] = url;
            } catch (err) {
              console.error(`Failed to upload ${key}:`, err);
              cleanData[key] = `[Upload Failed: ${file.name}]`;
            }
          } else {
            cleanData[key] = null;
          }
        } else {
          // Keep all other data
          cleanData[key] = value !== undefined ? value : null;
        }
      }

      console.log("Clean data ready, saving to Firestore with ID:", newAppId);

      // Firestore save with specific ID (Application No.)
      const savePromise = setDoc(doc(db, "applications", newAppId), {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "Submitted",
        userId: userData?.uid || 'anonymous',
        applicationId: newAppId
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore connection timeout. Please check your internet connection.")), 20000)
      );

      await Promise.race([savePromise, timeoutPromise]);
      
      console.log("=== SUCCESS === Application Saved with ID:", newAppId);
      
      // Move to payment step
      setFormStep(1);
    } catch (e) {
      console.error("=== SUBMIT ERROR DETAILS ===");
      console.error("Error Code:", e.code);
      console.error("Error Message:", e.message);
      console.error("Full Error:", e);
      
      let userMessage = "Submission Failed: " + (e.message || "Unknown error");
      
      if (e.code === 'permission-denied') {
        userMessage = "Access Denied: Please ensure the database rules are deployed and your connection is not being blocked by an adblocker (like uBlock Origin or AdBlock).";
      } else if (e.message?.includes("timeout") || e.code === 'unavailable') {
        userMessage = "Network Error: Could not connect to Firebase. This is usually caused by an adblocker blocking 'firestore.googleapis.com'. Please disable your adblocker and try again.";
      }
      
      alert(userMessage);

    } finally {
      setIsSubmitting(false);
      console.log("=== SUBMIT END ===");
    }
  };

  if (formStep === 1) {
    return (
      <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-fade-in-up">
        <div className="bg-gradient-to-r from-green-700 to-emerald-800 py-12 px-12 text-white text-center relative">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md animate-success-pop">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-3 tracking-tight">Submitted Successfully!</h2>
          <p className="text-green-50 text-lg font-medium">Your application has been recorded in our system.</p>
        </div>
        
        <div className="p-10 space-y-10 text-center">
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 space-y-4">
            <h3 className="text-blue-800 font-bold text-xl flex items-center justify-center">
               <CreditCard size={24} className="mr-3" />
               Final Step: Application Fee
            </h3>
            <p className="text-blue-600 font-medium">Please complete the payment for the Teacher Recruitment Application Fee to finalize your application.</p>
            <div className="text-6xl font-black text-gray-900 py-4">₹250 INR</div>
          </div>

          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Application No</span>
              <span className="font-mono font-bold text-lg text-green-700">{generatedAppId}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Candidate Name</span>
              <span className="font-bold text-gray-800 text-lg">{watch("name")}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Date</span>
              <span className="font-medium text-gray-700">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={handlePayment}
              className="w-full flex items-center justify-center px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xl font-bold rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <CreditCard className="mr-3" size={28} />
              PAY NOW
            </button>
            <p className="text-gray-400 text-xs font-medium">
              Secure Checkout • UPI, Cards & Net Banking Accepted
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (formStep === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in text-center px-6">
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 shadow-2xl relative">
          <CheckCircle size={56} />
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <CreditCard size={20} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Payment Successful!</h2>
        <div className="space-y-4 max-w-lg">
          <p className="text-gray-600 text-xl font-medium leading-relaxed">
            Your application for <span className="text-green-700 font-bold">Army Public School, Old Cantt, Prayagraj</span> has been fully processed and successfully submitted.
          </p>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 inline-block mb-4">
            <p className="text-green-800 font-bold">Transaction ID: TXN_{(Math.random() * 1000000).toFixed(0)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 no-print">
          <button 
            onClick={() => window.print()}
            className="flex items-center px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-95"
          >
            <Printer size={20} className="mr-2" />
            Print Full Application
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-green-500 hover:text-green-700 transition-all transform active:scale-95"
          >
            <Download size={20} className="mr-2" />
            Save as PDF
          </button>
        </div>

        {/* PRINT ONLY SECTION - Hidden on Screen */}
        <div className="hidden print:block text-left p-8 bg-white w-full max-w-4xl mx-auto border-2 border-gray-100 rounded-xl mt-12">
            <div className="border-b-4 border-green-800 pb-6 mb-8 text-center">
                <h1 className="text-3xl font-bold text-green-900 uppercase">Army Public School, Old Cantt, Prayagraj</h1>
                <p className="text-xl font-semibold">Teacher Recruitment Application ({(new Date().getFullYear())})</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 text-sm uppercase text-gray-500">Candidate Info</h3>
                    <p className="text-lg"><b>Name:</b> {watch("name")}</p>
                    <p className="text-lg"><b>Post:</b> {watch("teachingType")} - {watch("pgtSubject") || watch("tgtSubject") || watch("balvatikaRole")}</p>
                    <p className="text-lg"><b>Email:</b> {watch("emailId")}</p>
                    <p className="text-lg"><b>Mobile:</b> {watch("mobNo")}</p>
                </div>
                <div>
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 text-sm uppercase text-gray-500">Submission Details</h3>
                    <p className="text-lg"><b>App ID:</b> {generatedAppId}</p>
                    <p className="text-lg"><b>Date:</b> {new Date().toLocaleDateString()}</p>
                    <p className="text-lg"><b>Payment:</b> Success (₹250)</p>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <p className="text-sm italic">This is an electronically generated copy of your application. Please keep this for future reference during the interview process.</p>
            </div>

            <div className="flex justify-between items-end mt-20 pt-8 border-t border-gray-200">
                <div className="text-center">
                    <div className="w-40 border-b border-black mb-1"></div>
                    <p className="text-xs font-bold uppercase">Candidate Signature</p>
                </div>
                <div className="text-center text-gray-400">
                    <p className="text-[10px]">APS Recruitment Portal System Verified</p>
                </div>
            </div>
        </div>

        <p className="mt-8 text-gray-400 text-sm no-print">
            A copy of this receipt has also been recorded in your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-fade-in-up">
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 py-10 px-12 text-white text-center sm:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 uppercase">Application Details</h2>
        <p className="text-green-100 font-medium text-lg">Position: PGT / TGT / Balvatika</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-16">
        
        {/* POST APPLIED FOR */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">1. Post Applied For</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <SelectField register={register} errors={errors} label="Type" name="type" options={['Teaching']} required />
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Please paste recent passport size colour photograph and signature <span className="text-red-500">*</span></label>
              <input type="file" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-lg p-1 bg-white" {...register("photoSignature")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField register={register} errors={errors} label="Teaching Role" name="teachingType" options={['PGT', 'TGT', 'Balvatika']} required />
            
            {teachingType === 'PGT' && (
              <SelectField register={register} errors={errors} label="PGT Subject" name="pgtSubject" options={['Physics', 'Mathematics', 'Counselor']} showAsterisk={true} />
            )}
            {teachingType === 'TGT' && (
              <SelectField register={register} errors={errors} label="TGT Subject" name="tgtSubject" options={['Hindi']} showAsterisk={true} />
            )}
            {teachingType === 'Balvatika' && (
              <SelectField register={register} errors={errors} label="Balvatika Role" name="balvatikaRole" options={['Balvatika Coordinator', 'Balvatika Teacher', 'Balvatika Assistant Teacher']} showAsterisk={true} />
            )}
          </div>
        </section>

        {/* PERSONAL DATA */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">2. Personal Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField register={register} errors={errors} label="Name" name="name" required />
            <InputField register={register} errors={errors} label="Son/Daughter/Wife of" name="relation" required />
            <InputField register={register} errors={errors} label="Date of Birth" name="dob" type="date" required />
            <InputField register={register} errors={errors} label="Nationality" name="nationality" required />
            <InputField register={register} errors={errors} label="State" name="state" required />
            <div className="md:col-span-2">
              <InputField register={register} errors={errors} label="Address" name="address" required />
            </div>
          </div>
        </section>

        {/* CONTACT DETAILS */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">3. Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField register={register} errors={errors} label="Mobile No" name="mobNo" required />
            <InputField register={register} errors={errors} label="Email ID" name="emailId" type="email" required />
            
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Verification Status</label>
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                <CheckCircle size={20} />
                <span className="font-medium">OTP Verified ✓</span>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">4. Present / Previous Experience</h3>
          <p className="text-sm text-gray-500 italic mb-4">(Certificate to be shown when asked)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField register={register} errors={errors} label="Do you have any experience?" name="hasExperience" options={['Yes', 'No']} required />
          </div>

          {hasExperience === 'Yes' && (
            <div className="space-y-6 mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField register={register} errors={errors} label="Designation of Post" name="exp_designation" required showAsterisk />
                <InputField register={register} errors={errors} label="Name and Address of Institution/Organization" name="exp_institution" required showAsterisk />
                
                <InputField register={register} errors={errors} label="Designation of superior In charge" name="exp_superior_designation" required showAsterisk />
                <InputField register={register} errors={errors} label="Contact No of superior" name="exp_superior_contact" required showAsterisk />
                
                <InputField register={register} errors={errors} label="Period of notice you will have to give, if selected?" name="exp_notice_period" required showAsterisk />
                <InputField register={register} errors={errors} label="What salary are you drawing?" name="exp_salary" required showAsterisk />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                <InputField register={register} errors={errors} label="Sr. no" name="exp_sr_no" required showAsterisk />
                <SelectField register={register} errors={errors} label="Designation" name="exp_role_type" options={['PGT', 'TGT', 'Balvatika', 'Other']} required showAsterisk />
                <InputField register={register} errors={errors} label="School/College" name="exp_school_college" required showAsterisk />
                
                <InputField register={register} errors={errors} label="Sub taught" name="exp_sub_taught" required showAsterisk />
                <InputField register={register} errors={errors} label="No of pupils taken" name="exp_pupils_taken" required showAsterisk />
                <InputField register={register} errors={errors} label="Total year in experience" name="exp_total_years" required showAsterisk />
              </div>
            </div>
          )}
        </section>

        {/* FAMILY LIFE */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">5. Family Life</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField register={register} errors={errors} label="Marital Status" name="maritalStatus" options={['Single', 'Married', 'Widowed', 'Divorced']} required />
            <InputField register={register} errors={errors} label="If married/widowed (Details)" name="marriedDetails" />
            <InputField register={register} errors={errors} label="Name & occupation of spouse" name="spouseDetails" />
            <InputField register={register} errors={errors} label="No of children with age and sex" name="childrenDetails" />
            <SelectField register={register} errors={errors} label="If Army Dependent" name="armyDependent" options={['Yes', 'No']} required />
            
            {armyDependent === 'Yes' && (
              <div className="flex flex-col space-y-2 animate-fade-in">
                <label className="text-sm font-semibold text-gray-700">
                  Upload Army Dependent Certificate <span className="text-red-500">*</span>
                </label>
                <input 
                  type="file" 
                  {...register("armyDependentFile")} 
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-lg p-1 bg-white shadow-sm transition-all" 
                />
              </div>
            )}
          </div>
        </section>

        {/* EDUCATIONAL QUALIFICATIONS */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">6. Educational Qualifications</h3>
          <p className="text-sm text-gray-500 italic mb-4">Give details of all exams starting from High School onwards</p>
          
          <div className="space-y-8">
            {qualifications.map((qual) => {
              let isMandatory = false;
              if (['highSchool', 'intermediate', 'graduation', 'professional'].includes(qual.id)) {
                isMandatory = true;
              } else if (qual.id === 'postGraduation') {
                isMandatory = teachingType === 'PGT';
              }


              return (
              <div key={qual.id} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 space-y-6">
                <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">{qual.label}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField register={register} errors={errors} label="Name of Board / Institute" name={`edu_${qual.id}_board`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField register={register} errors={errors} label="Subject" name={`edu_${qual.id}_subject`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField register={register} errors={errors} label="Year" name={`edu_${qual.id}_year`} required={isMandatory} showAsterisk={isMandatory} />
                  
                  <InputField register={register} errors={errors} label="Marks Obtained" name={`edu_${qual.id}_marks`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField register={register} errors={errors} label="Total Marks" name={`edu_${qual.id}_totalMarks`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField register={register} errors={errors} label="Percentage" name={`edu_${qual.id}_percent`} required={isMandatory} showAsterisk={isMandatory} />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Upload scanned marksheet {isMandatory && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="file" 
                    {...register(`edu_${qual.id}_file`)} 
                    className="block w-full md:w-1/3 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 border border-gray-300 rounded-lg p-1 bg-white shadow-sm transition-all" 
                  />
                </div>
              </div>
            )})}
          </div>
        </section>

        {/* CSB AND CTET */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">7. CSB and CTET</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField register={register} errors={errors} label="CSB Status" name="csb" options={['Yes', 'No']} required />
            <SelectField register={register} errors={errors} label="CTET Status" name="ctet" options={['Yes', 'No']} required />
            
            {csbStatus === 'Yes' && (
              <>
                <InputField register={register} errors={errors} label="Percentage in CSB" name="csbPercent" required showAsterisk />
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Upload CSB Certificate <span className="text-red-500">*</span></label>
                  <input type="file" {...register("csbFile")} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm" />
                </div>
              </>
            )}

            {ctetStatus === 'Yes' && (
              <>
                <InputField register={register} errors={errors} label="Percentage in CTET" name="ctetPercent" required showAsterisk />
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Upload CTET Certificate <span className="text-red-500">*</span></label>
                  <input type="file" {...register("ctetFile")} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm" />
                </div>
              </>
            )}
          </div>
        </section>

        {/* AGREEMENT */}
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">8. Agreement & Payment</h3>
            <div className="text-lg font-bold text-green-800 bg-green-100 px-4 py-1 rounded-full shadow-sm">
              Application Fee: ₹250 INR
            </div>
          </div>
          
          <div className="text-sm text-gray-700 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold">If appointed:-</p>
            <p>(a) I agree to abide by the AWES Rule and Regulation for Army Public Schools, Old Cantt, Prayagraj</p>
            <p>(b) I undertake to serve the school till the end of the final term, ie upto the finalization of the results of the class taught or a period specified/ fixed by the management.</p>
            <p>(c) I solemnly state the all the above particulars/statements are true to the best of my knowledge and belief.</p>
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="agreement" 
              {...register("agreement", { required: true })} 
              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
            <label htmlFor="agreement" className="text-sm font-semibold text-gray-800">
              I agree to the Privacy Policy and Terms & Conditions *
            </label>
          </div>
          {errors.agreement && <span className="text-xs text-red-500">You must agree to the terms to submit.</span>}
        </section>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto md:min-w-[200px] float-right flex justify-center items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-800 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="mr-2" size={24} />
                SUBMIT APPLICATION
              </>
            )}
          </button>
          <div className="clear-both"></div>
        </div>

      </form>
    </div>
  );
}
