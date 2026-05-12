import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UploadCloud, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const qualifications = [
  { id: 'highSchool', label: 'High School' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'professional', label: 'B.Ed/B.El.Ed/D.El.Ed./B.P. Ed/M.Ed/M.P.Ed./ Professional Qualification' },
  { id: 'postGraduation', label: 'Post Graduation' },
  { id: 'anyOther', label: 'Any Other Qualification' },
];

export default function ApplicationForm({ userData }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      mobNo: userData?.mobile || '',
      emailId: userData?.email || '',
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const teachingType = watch("teachingType");
  const hasExperience = watch("hasExperience");
  const armyDependent = watch("armyDependent");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // In a real app, you would upload files to Firebase Storage here and get URLs
      // For this demo, we'll save the text data to Firestore
      const docRef = await addDoc(collection(db, "applications"), {
        ...data,
        createdAt: new Date(),
        status: "Submitted"
      });
      setSubmitted(true);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("There was an error submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-xl">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">Application Submitted Successfully!</h2>
        <p className="text-gray-600 text-lg max-w-lg text-center">
          Thank you for applying to Army Public School. Your application has been received and is under review.
        </p>
      </div>
    );
  }

  const InputField = ({ label, name, type = 'text', required = false, showAsterisk = false }) => (
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

  const SelectField = ({ label, name, options, required = false, showAsterisk = false }) => (
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

  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/50 my-8 animate-fade-in-up">
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-8 px-10 text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Application Form</h1>
        <p className="text-green-100 font-medium mt-1 text-lg">For the post of PGT/TGT/PRT</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-12">
        
        {/* POST APPLIED FOR */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">1. Post Applied For</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <SelectField label="Type" name="type" options={['Teaching']} required />
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Please paste recent passport size colour photograph and signature <span className="text-red-500">*</span></label>
              <input type="file" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-lg p-1 bg-white" {...register("photoSignature", { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Teaching Role" name="teachingType" options={['PGT', 'TGT', 'PRT', 'Balvatika']} required />
            
            {teachingType === 'PGT' && (
              <SelectField label="PGT Subject" name="pgtSubject" options={['Physics', 'Mathematics', 'Counselor']} showAsterisk={true} />
            )}
            {teachingType === 'TGT' && (
              <SelectField label="TGT Subject" name="tgtSubject" options={['Hindi']} showAsterisk={true} />
            )}
            {teachingType === 'Balvatika' && (
              <SelectField label="Balvatika Role" name="balvatikaRole" options={['Balvatika Coordinator', 'Balvatika Teacher', 'Balvatika Assistant Teacher']} showAsterisk={true} />
            )}
          </div>
        </section>

        {/* PERSONAL DATA */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">2. Personal Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Name" name="name" required />
            <InputField label="Son/Daughter/Wife of" name="relation" required />
            <InputField label="Date of Birth" name="dob" type="date" required />
            <InputField label="Nationality" name="nationality" required />
            <InputField label="State" name="state" required />
            <div className="md:col-span-2">
              <InputField label="Address" name="address" required />
            </div>
          </div>
        </section>

        {/* CONTACT DETAILS */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">3. Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Mobile No" name="mobNo" required />
            <InputField label="Email ID" name="emailId" type="email" required />
            
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
            <SelectField label="Do you have any experience?" name="hasExperience" options={['Yes', 'No']} required />
          </div>

          {hasExperience === 'Yes' && (
            <div className="space-y-6 mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Designation of Post" name="exp_designation" required showAsterisk />
                <InputField label="Name and Address of Institution/Organization" name="exp_institution" required showAsterisk />
                
                <InputField label="Designation of superior In charge" name="exp_superior_designation" required showAsterisk />
                <InputField label="Contact No of superior" name="exp_superior_contact" required showAsterisk />
                
                <InputField label="Period of notice you will have to give, if selected?" name="exp_notice_period" required showAsterisk />
                <InputField label="What salary are you drawing?" name="exp_salary" required showAsterisk />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                <InputField label="Sr. no" name="exp_sr_no" required showAsterisk />
                <SelectField label="Designation" name="exp_role_type" options={['PGT', 'TGT', 'PRT', 'Balvatika', 'Other']} required showAsterisk />
                <InputField label="School/College" name="exp_school_college" required showAsterisk />
                
                <InputField label="Sub taught" name="exp_sub_taught" required showAsterisk />
                <InputField label="No of pupils taken" name="exp_pupils_taken" required showAsterisk />
                <InputField label="Total year in experience" name="exp_total_years" required showAsterisk />
              </div>
            </div>
          )}
        </section>

        {/* FAMILY LIFE */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">5. Family Life</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Marital Status" name="maritalStatus" options={['Single', 'Married', 'Widowed', 'Divorced']} required />
            <InputField label="If married/widowed (Details)" name="marriedDetails" />
            <InputField label="Name & occupation of spouse" name="spouseDetails" />
            <InputField label="No of children with age and sex" name="childrenDetails" />
            <SelectField label="If Army Dependent" name="armyDependent" options={['Yes', 'No']} required />
            
            {armyDependent === 'Yes' && (
              <div className="flex flex-col space-y-2 animate-fade-in">
                <label className="text-sm font-semibold text-gray-700">
                  Upload Army Dependent Certificate <span className="text-red-500">*</span>
                </label>
                <input 
                  type="file" 
                  {...register("armyDependentFile", { required: true })} 
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
                isMandatory = teachingType === 'TGT' || teachingType === 'PGT';
              }

              return (
              <div key={qual.id} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 space-y-6">
                <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">{qual.label}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Name of Board / Institute" name={`edu_${qual.id}_board`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField label="Subject" name={`edu_${qual.id}_subject`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField label="Year" name={`edu_${qual.id}_year`} required={isMandatory} showAsterisk={isMandatory} />
                  
                  <InputField label="Marks Obtained" name={`edu_${qual.id}_marks`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField label="Total Marks" name={`edu_${qual.id}_totalMarks`} required={isMandatory} showAsterisk={isMandatory} />
                  <InputField label="Percentage" name={`edu_${qual.id}_percent`} required={isMandatory} showAsterisk={isMandatory} />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Upload scanned marksheet {isMandatory && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="file" 
                    {...register(`edu_${qual.id}_file`, { required: isMandatory })} 
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
            <SelectField label="CSB Status" name="csb" options={['Yes', 'No']} required />
            <SelectField label="CTET Status" name="ctet" options={['Yes', 'No']} required />
            <InputField label="Percentage in CTET" name="ctetPercent" />
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Upload CTET Certificate</label>
              <input type="file" {...register("ctetFile")} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm" />
            </div>
          </div>
        </section>

        {/* AGREEMENT */}
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">8. Agreement & Payment</h3>
            <div className="text-lg font-bold text-green-800 bg-green-100 px-4 py-1 rounded-full shadow-sm">
              Amount: ₹250
            </div>
          </div>
          
          <div className="text-sm text-gray-700 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold">If appointed:-</p>
            <p>(a) I agree to abide by the AWES Rule and Regulation for Army Public Schools</p>
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
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
