import React from 'react';

const LegalLayout = ({ title, children }) => (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
            <div className="prose prose-slate max-w-none text-slate-600">
                {children}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <a href="/" className="text-brand-primary font-bold hover:underline">← Back to App</a>
            </div>
        </div>
    </div>
);

export const Terms = () => (
    <LegalLayout title="Terms & Conditions">
        <p className="mb-4 text-sm font-bold text-slate-500">Last Updated: January 28, 2026</p>
        <p className="mb-4">Welcome to Twingle (the “Website”). By accessing or using this Website, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Website.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">1. Eligibility</h3>
        <p>Users must be 18 years or older to use this Website.</p>
        <p>By using this Website, you confirm that all information you provide is true, accurate, and lawful.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">2. Nature of Service</h3>
        <p>Twingle is an online platform for social interaction and dating.</p>
        <p>We do not guarantee matches, conversations, relationships, or outcomes.</p>
        <p>Users are solely responsible for their interactions with other users, both online and offline.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">3. User Conduct</h3>
        <p>Users agree not to:</p>
        <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Post false, misleading, defamatory, abusive, obscene, or illegal content</li>
            <li>Impersonate any person or entity</li>
            <li>Harass, threaten, or exploit other users</li>
            <li>Use the platform for fraud, solicitation, or unlawful activities</li>
        </ul>
        <p>Violation of these rules may result in account suspension or permanent termination without notice.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">4. Content & Libel Disclaimer</h3>
        <p>All content posted by users is their sole responsibility.</p>
        <p>Twingle does not verify user-generated content and is not responsible for any defamatory, offensive, or unlawful material posted by users.</p>
        <p>Any disputes, claims, or legal actions arising from user content must be resolved directly between the users involved.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">5. Account Suspension & Termination</h3>
        <p>We reserve the right to suspend or permanently disable any account at our sole discretion if Terms are violated or misuse is detected.</p>
        <p>Account suspension or termination does not entitle the user to any refund.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">6. Payments & No Refund Policy</h3>
        <p>Payments made on this Website are strictly for access and usage of the platform only.</p>
        <p>All payments are final and non-refundable, including but not limited to:</p>
        <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Account suspension</li>
            <li>Account termination</li>
            <li>Violation of Terms</li>
            <li>User dissatisfaction</li>
            <li>Technical issues</li>
        </ul>
        <p>This no-refund policy applies only to website usage fees, not to subscriptions (if applicable).</p>

        <h3 className="text-lg font-bold mt-6 mb-2">7. Limitation of Liability</h3>
        <p>Twingle shall not be liable for:</p>
        <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>User behavior or interactions</li>
            <li>Loss, injury, emotional distress, or damages arising from platform use</li>
            <li>Unauthorized access to user accounts</li>
        </ul>
        <p>Use of the Website is entirely at the user’s own risk.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">8. Privacy</h3>
        <p>User data is handled as per our Privacy Policy.</p>
        <p>We do not guarantee absolute security of information transmitted over the internet.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">9. Changes to Terms</h3>
        <p>We reserve the right to modify these Terms & Conditions at any time.</p>
        <p>Continued use of the Website after changes means acceptance of the updated Terms.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">10. Governing Law & Jurisdiction</h3>
        <p>These Terms shall be governed by the laws of India.</p>
        <p>Any disputes shall be subject to the exclusive jurisdiction of Indian courts.</p>

        <h3 className="text-lg font-bold mt-6 mb-2">11. Contact Information</h3>
        <p>For any queries, concerns, or support requests, please contact:</p>
        <p className="font-bold">📧 teamtwingle@gmail.com</p>
    </LegalLayout>
);

export const Privacy = () => (
    <LegalLayout title="Privacy Policy">
        <p>We value your privacy. This policy explains how we handle your data.</p>

        <h3>1. Data Collection</h3>
        <p>We collect information you provide directly to us, including your name, photos, birth date, and location data to facilitate matching.</p>

        <h3>2. Data Usage</h3>
        <p>We use your data to:</p>
        <ul>
            <li>Provide and improve our matching algorithm</li>
            <li>Ensure community safety and moderation</li>
            <li>Process subscription payments</li>
        </ul>

        <h3>3. Data Sharing</h3>
        <p>We do not sell your personal data. We may share data with third-party service providers (like payment processors) only as necessary.</p>

        <h3>4. Grievance Officer (India)</h3>
        <p>In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:</p>
        <p><strong>Name:</strong> Adarsh (Head of Support)</p>
        <p><strong>Email:</strong> grievance@twingle.com</p>
        <p><strong>Address:</strong> Twingle HQ, Kerala, India</p>
    </LegalLayout>
);

export const Guidelines = () => (
    <LegalLayout title="Community Guidelines">
        <p>Mallu Match is a safe space for dating and friendship. Please adhere to these rules.</p>

        <h3>❌ Don'ts</h3>
        <ul>
            <li>No nudity or sexually explicit content</li>
            <li>No hate speech or bullying</li>
            <li>No scamming or solicitation of money</li>
            <li>No sharing of private contact info in public bios</li>
        </ul>

        <h3>✅ Dos</h3>
        <ul>
            <li>Be respectful and kind</li>
            <li>Report suspicious behavior</li>
            <li>Use recent and authentic photos</li>
            <li>Communicate clearly and honestly</li>
        </ul>

        <h3>Safety Tips</h3>
        <p>Never share financial information. Meet in public places for first dates. Tell a friend where you are going.</p>
    </LegalLayout>
);
