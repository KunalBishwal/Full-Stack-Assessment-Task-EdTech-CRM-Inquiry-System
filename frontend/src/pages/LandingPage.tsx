import React, { useState } from 'react';
import { Award, Music, GraduationCap, HelpCircle, Users, School, UserCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InquiryForm } from '../components/InquiryForm';
import { InquiryCategory } from '../types';

const INQUIRY_CATEGORIES: Array<{
  category: InquiryCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    category: 'Scholarship',
    title: 'Scholarships',
    icon: Award,
    description:
      'Questions regarding K–12 student scholarship eligibility, application steps, and required documentation.',
  },
  {
    category: 'Concert',
    title: 'Concerts & Events',
    icon: Music,
    description:
      'Inquiries about student musical performances, school participation, and upcoming cultural events.',
  },
  {
    category: 'Admission',
    title: 'Admissions',
    icon: GraduationCap,
    description:
      'Guidance for parents and students exploring enrollment, grade placement, and program details.',
  },
  {
    category: 'General Query',
    title: 'General Queries',
    icon: HelpCircle,
    description:
      'School partnerships, curriculum questions, or any other general correspondence with our team.',
  },
];

export const LandingPage: React.FC = () => {
  const [preselectedCategory, setPreselectedCategory] = useState<InquiryCategory | ''>('');

  const handleCategorySelect = (category: InquiryCategory) => {
    setPreselectedCategory(category);
    const formElement = document.getElementById('inquiry-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-canvas-subtle text-ink-secondary border border-canvas-border">
                  K12 Hunar Inquiry Desk
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-ink leading-[1.15]">
                  Connect with K12 Hunar for scholarships, concerts, and admissions.
                </h1>
                <p className="text-base text-ink-secondary leading-relaxed">
                  Whether you are a parent looking for program details, a student inquiring about
                  scholarships or concerts, or a school representative exploring collaboration, use
                  this portal to reach the right team directly.
                </p>
              </div>

              <div className="bg-white border border-canvas-border rounded-lg p-5 sm:p-6 shadow-editorial space-y-4">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Who Can Submit an Inquiry
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3.5 rounded-md bg-canvas/70 border border-canvas-border space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Parents</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Ask about admissions, student eligibility, or program schedules for your
                      child.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-md bg-canvas/70 border border-canvas-border space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      <UserCheck className="w-4 h-4 text-accent" />
                      <span>Students</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Inquire about scholarship criteria, concert participation, or student
                      programs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-md bg-canvas/70 border border-canvas-border space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      <School className="w-4 h-4 text-accent" />
                      <span>Schools</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Coordinate institutional participation, group registrations, or general
                      queries.
                    </p>
                  </div>
                </div>
              </div>

              <div id="categories" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold text-ink">
                    Inquiry Categories
                  </h2>
                  <span className="text-xs text-ink-muted">
                    Select a category to pre-fill the form
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {INQUIRY_CATEGORIES.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = preselectedCategory === item.category;
                    return (
                      <button
                        key={item.category}
                        type="button"
                        onClick={() => handleCategorySelect(item.category)}
                        className={`text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-accent-subtle/60 border-accent ring-1 ring-accent'
                            : 'bg-white border-canvas-border hover:border-canvas-borderStrong'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-canvas-subtle flex items-center justify-center text-accent shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm text-ink">{item.title}</span>
                        </div>
                        <p className="text-xs text-ink-secondary leading-relaxed mt-2.5">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div id="inquiry-form" className="lg:col-span-6">
              <InquiryForm selectedCategory={preselectedCategory} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
