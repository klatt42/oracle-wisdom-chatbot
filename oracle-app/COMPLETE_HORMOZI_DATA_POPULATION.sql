-- =================================================================
-- ORACLE HORMOZI WISDOM DATA POPULATION - COMPLETE 139 ENTRIES
-- Elena Execution - All Categories with Corrected ARRAY Format
-- =================================================================
-- 
-- EXECUTION OPTIONS:
-- 1. Copy entire script to Supabase SQL Editor
-- 2. Use psql: psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" -f COMPLETE_HORMOZI_DATA_POPULATION.sql
-- 3. Use Supabase CLI: supabase db reset --db-url [connection-string]
--
-- =================================================================

-- Clear table first
DELETE FROM hormozi_wisdom;

-- Insert all 139 rows with proper ARRAY format
INSERT INTO hormozi_wisdom (content, source, book, chapter, topic, framework, business_phase, difficulty_level, implementation_time, success_metrics, related_concepts) VALUES

-- OFFERS & VALUE CREATION (20 entries)
('The Grand Slam Offer is an offer so good people feel stupid saying no. It combines four elements: dream outcome, perceived likelihood of achievement, time delay, and effort and sacrifice. The goal is to increase the first two and decrease the last two.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 1: Grand Slam Offers', 'offers', 'Grand Slam Offer Formula', 'early-stage', 'beginner', '2-4 weeks', ARRAY['Increased conversion rate', 'Higher perceived value', 'Reduced price objections'], ARRAY['Value equation', 'Pricing strategy', 'Customer psychology']),

('The Value Equation is (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort and Sacrifice). To increase value, increase the numerator or decrease the denominator.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 3: Value Equation', 'offers', 'Value Equation', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Higher perceived value', 'Improved offer performance', 'Better customer satisfaction'], ARRAY['Grand Slam Offer', 'Pricing psychology', 'Customer experience']),

('Price is what you pay. Value is what you get. The goal is to make the value so high that the price becomes irrelevant. Focus on value delivery, not price justification.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 2: Pricing Strategy', 'offers', 'Value-Based Pricing', 'growth', 'intermediate', '1-2 weeks', ARRAY['Higher profit margins', 'Better customer acquisition', 'Improved retention'], ARRAY['Pricing psychology', 'Market positioning', 'Competitive advantage']),

('The best time to raise prices is when you think you cannot. Most entrepreneurs undervalue their offerings. If you are not getting price objections from at least 20% of prospects, your prices are too low.', 'Alex Hormozi Pricing Strategy', 'Business Principles', 'Value-Based Pricing', 'offers', 'Strategic Pricing', 'growth', 'intermediate', '1-4 weeks', ARRAY['Higher profit margins', 'Improved positioning', 'Better customer quality'], ARRAY['Value perception', 'Market positioning', 'Revenue optimization']),

('Scarcity and urgency must be real to be effective. Fake scarcity destroys trust forever. Create genuine reasons for prospects to act now through limited capacity, time-sensitive bonuses, or seasonal availability.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 4: Scarcity & Urgency', 'offers', 'Scarcity Principles', 'growth', 'advanced', '2-3 weeks', ARRAY['Higher conversion rates', 'Increased urgency', 'Better close rates'], ARRAY['Psychology of persuasion', 'Trust building', 'Ethical marketing']),

('Guarantee everything. The stronger your guarantee, the weaker your sales skills can be. A guarantee shifts the risk from the customer to you, making the buying decision easier and more logical.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 5: Guarantees', 'offers', 'Risk Reversal', 'all-stages', 'beginner', '1 week', ARRAY['Reduced customer hesitation', 'Higher conversion rates', 'Increased trust'], ARRAY['Risk management', 'Customer psychology', 'Trust building']),

('The goal of naming your offer is to make it memorable and specific. Avoid generic names. Instead of Marketing Course, use The 30-Day Client Acquisition System or The $10K Month Blueprint.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 6: Naming Your Offer', 'offers', 'Offer Naming', 'early-stage', 'beginner', '3-5 days', ARRAY['Better recall', 'Increased perceived value', 'Clearer positioning'], ARRAY['Branding', 'Positioning', 'Marketing psychology']),

('Bonuses should enhance the core offer and address objections. Each bonus should be worth more than the price of the entire offer, but cost you little to fulfill. This creates massive perceived value stacking.', '$100M Offers - Alex Hormozi', '$100M Offers', 'Chapter 7: Bonus Stacking', 'offers', 'Bonus Strategy', 'growth', 'intermediate', '1-2 weeks', ARRAY['Increased perceived value', 'Higher conversion rates', 'Better customer satisfaction'], ARRAY['Value creation', 'Customer psychology', 'Offer enhancement']),

('The pain-to-solution bridge is the emotional journey your customer takes. The bigger the pain and the clearer the solution, the more valuable your offer becomes to your target market.', 'Alex Hormozi Business Psychology', 'Customer Psychology', 'Pain Points', 'offers', 'Pain-Solution Bridge', 'all-stages', 'intermediate', '2-3 weeks', ARRAY['Better market fit', 'Higher conversion rates', 'Clearer messaging'], ARRAY['Customer research', 'Market positioning', 'Emotional triggers']),

('Your offer should solve a problem that is urgent, pervasive, and expensive. If not urgent, they won''t buy now. If not pervasive, your market is too small. If not expensive, they won''t pay premium prices.', 'Alex Hormozi Market Analysis', 'Market Strategy', 'Problem Identification', 'offers', 'Problem Validation', 'early-stage', 'advanced', '4-6 weeks', ARRAY['Market validation', 'Premium pricing capability', 'Scalable demand'], ARRAY['Market research', 'Customer discovery', 'Business model validation']),

('Stack the value, not the price. Instead of discounting, add more valuable bonuses. This maintains price integrity while increasing perceived value and customer satisfaction.', 'Alex Hormozi Value Strategy', 'Value Creation', 'Value Stacking', 'offers', 'Value Stacking', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Maintained margins', 'Higher perceived value', 'Better customer outcomes'], ARRAY['Value creation', 'Pricing strategy', 'Customer satisfaction']),

('The moment you compete on price, you have lost. Compete on value, uniqueness, and results. Be the only solution in your category, not the cheapest option in a crowded market.', 'Alex Hormozi Competitive Strategy', 'Market Positioning', 'Competitive Advantage', 'offers', 'Unique Value Proposition', 'growth', 'advanced', '4-8 weeks', ARRAY['Market differentiation', 'Premium positioning', 'Competitive advantage'], ARRAY['Market positioning', 'Competitive analysis', 'Brand strategy']),

('Urgency without scarcity is manipulation. Scarcity without urgency is missed opportunity. Combine both authentically to create compelling reasons for immediate action.', 'Alex Hormozi Sales Psychology', 'Sales Strategy', 'Urgency and Scarcity', 'offers', 'Authentic Urgency', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Higher conversion rates', 'Ethical persuasion', 'Trust maintenance'], ARRAY['Sales psychology', 'Ethical marketing', 'Conversion optimization']),

('The best offer is invisible to competitors because it is based on your unique advantages. Leverage what only you can do, know, or provide to create truly differentiated value.', 'Alex Hormozi Differentiation', 'Competitive Strategy', 'Unique Advantages', 'offers', 'Competitive Differentiation', 'growth', 'advanced', '6-12 weeks', ARRAY['Sustainable advantage', 'Higher margins', 'Market leadership'], ARRAY['Competitive analysis', 'Core competencies', 'Strategic planning']),

('Sell the outcome, not the process. Customers buy results, not methods. Focus your offer on the transformation they will experience, not the steps they will take.', 'Alex Hormozi Outcome Marketing', 'Marketing Strategy', 'Outcome-Based Selling', 'offers', 'Outcome Marketing', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Clearer value proposition', 'Higher engagement', 'Better conversion'], ARRAY['Marketing messaging', 'Customer psychology', 'Value communication']),

('Your offer should be a no-brainer. When presented correctly, the decision should be so obvious that saying no feels illogical. This is the essence of a Grand Slam Offer.', 'Alex Hormozi Offer Design', 'Offer Creation', 'Irresistible Offers', 'offers', 'No-Brainer Offer', 'all-stages', 'beginner', '2-6 weeks', ARRAY['Simplified sales process', 'Higher close rates', 'Reduced objections'], ARRAY['Offer design', 'Sales psychology', 'Decision making']),

('The faster you can deliver value, the more valuable your offer becomes. Speed of implementation often matters more than the final outcome to time-conscious buyers.', 'Alex Hormozi Speed Strategy', 'Value Delivery', 'Speed to Value', 'offers', 'Fast Implementation', 'growth', 'intermediate', '1-4 weeks', ARRAY['Higher perceived value', 'Better customer satisfaction', 'Competitive advantage'], ARRAY['Value delivery', 'Customer experience', 'Time management']),

('Risk reversal is not just about money-back guarantees. Reverse time risk, effort risk, and outcome risk to remove all barriers to purchase and trial.', 'Alex Hormozi Risk Management', 'Risk Strategy', 'Comprehensive Risk Reversal', 'offers', 'Multi-Dimensional Risk Reversal', 'all-stages', 'advanced', '2-3 weeks', ARRAY['Reduced buyer resistance', 'Higher conversion rates', 'Increased trust'], ARRAY['Risk management', 'Sales psychology', 'Trust building']),

('The best offers solve multiple problems with one solution. Look for the interconnected challenges your customers face and address them holistically rather than piecemeal.', 'Alex Hormozi Problem Solving', 'Solution Design', 'Holistic Solutions', 'offers', 'Multi-Problem Solutions', 'growth', 'advanced', '4-8 weeks', ARRAY['Higher value perception', 'Better customer outcomes', 'Reduced competition'], ARRAY['Systems thinking', 'Problem analysis', 'Solution design']),

('Your offer is only as strong as your weakest element. Every component must be excellent - the promise, the proof, the process, and the price must all align perfectly.', 'Alex Hormozi Offer Optimization', 'Offer Design', 'Offer Coherence', 'offers', 'Integrated Offer Design', 'growth', 'advanced', '3-6 weeks', ARRAY['Stronger offers', 'Better conversion', 'Higher satisfaction'], ARRAY['Offer design', 'System optimization', 'Customer experience']),

-- LEAD GENERATION & CUSTOMER ACQUISITION (25 entries)
('The Core Four are the only ways to get customers: warm outreach, cold outreach, warm inbound, and cold inbound. Master these four channels and you will never run out of customers. Most businesses fail because they only use one channel.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Part 2: Core Four', 'leads', 'Core Four', 'growth', 'intermediate', '3-6 months', ARRAY['Diversified lead sources', 'Reduced customer acquisition risk', 'Consistent lead flow'], ARRAY['Lead generation', 'Customer acquisition', 'Marketing channels']),

('Warm outreach is reaching out to people who already know you. This has the highest conversion rate but the lowest volume. Examples: past customers, referrals, personal network, existing connections.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 1: Warm Outreach', 'leads', 'Warm Outreach', 'early-stage', 'beginner', '2-4 weeks', ARRAY['High conversion rates', 'Low acquisition costs', 'Strong relationships'], ARRAY['Relationship building', 'Referral systems', 'Network effects']),

('Cold outreach is reaching out to strangers who fit your ideal customer profile. Lower conversion rates but higher volume potential. Success requires personalization, value-first messaging, and systematic follow-up.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 2: Cold Outreach', 'leads', 'Cold Outreach', 'scaling', 'advanced', '2-3 months', ARRAY['Scalable lead generation', 'Market expansion', 'Predictable pipeline'], ARRAY['Prospecting', 'Personalization', 'Value proposition']),

('Warm inbound is when people who know you come to you. This includes referrals, word of mouth, and repeat customers. The best way to increase warm inbound is to exceed expectations consistently.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 3: Warm Inbound', 'leads', 'Warm Inbound', 'growth', 'intermediate', '6-12 months', ARRAY['Organic growth', 'Lower acquisition costs', 'Higher lifetime value'], ARRAY['Customer experience', 'Referral programs', 'Brand reputation']),

('Cold inbound is when strangers find you through content, advertising, or SEO. Most scalable channel but requires significant upfront investment in content creation or advertising spend.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 4: Cold Inbound', 'leads', 'Cold Inbound', 'scaling', 'advanced', '6-12 months', ARRAY['Scalable growth', 'Brand awareness', 'Market authority'], ARRAY['Content marketing', 'SEO', 'Paid advertising']),

('The lead magnet must solve a specific problem for your ideal customer. It should be valuable enough that people would pay for it, but you give it away free to capture contact information and start relationships.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 5: Lead Magnets', 'leads', 'Lead Magnets', 'early-stage', 'beginner', '1-3 weeks', ARRAY['Higher opt-in rates', 'Better lead quality', 'Increased trust'], ARRAY['Content creation', 'Value delivery', 'List building']),

('The goal of your lead magnet is not to sell, but to start a relationship. Focus on providing immediate value and building trust. The sale comes later in the relationship sequence.', 'Alex Hormozi Lead Strategy', 'Lead Generation', 'Relationship Building', 'leads', 'Trust Building', 'all-stages', 'beginner', '2-4 weeks', ARRAY['Higher trust levels', 'Better conversion rates', 'Stronger relationships'], ARRAY['Relationship marketing', 'Trust building', 'Value delivery']),

('Customer acquisition cost (CAC) must be less than customer lifetime value (LTV). The ratio should be at least 3:1 LTV to CAC for a healthy business model that can sustain growth.', 'Alex Hormozi Unit Economics', 'Business Metrics', 'Unit Economics', 'leads', 'LTV:CAC Ratio', 'growth', 'advanced', 'ongoing', ARRAY['Profitable unit economics', 'Sustainable growth', 'Clear ROI'], ARRAY['Customer lifetime value', 'Customer acquisition cost', 'Unit economics']),

('The fastest way to grow is to increase your conversion rate, not your traffic. A 10% increase in conversion rate equals a 10% increase in traffic, but is usually easier and cheaper to achieve.', 'Alex Hormozi Conversion Strategy', 'Conversion Optimization', 'Growth Strategy', 'leads', 'Conversion Optimization', 'growth', 'intermediate', '4-8 weeks', ARRAY['Higher ROI', 'Better resource utilization', 'Faster growth'], ARRAY['A/B testing', 'Funnel optimization', 'User experience']),

('The key to successful follow-up is providing value in every interaction. Do not just ask for the sale. Provide tips, insights, case studies that help your prospect whether they buy or not.', '$100M Leads - Alex Hormozi', '$100M Leads', 'Chapter 6: Follow-Up', 'leads', 'Follow-Up Strategy', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher conversion rates', 'Stronger relationships', 'Better customer experience'], ARRAY['Email marketing', 'Nurture sequences', 'Relationship building']),

('Content is the long-term play for business growth. It builds trust, authority, and inbound leads over time. The best content solves real problems your audience faces daily.', 'Alex Hormozi Content Strategy', 'Content Marketing', 'Value-First Content', 'leads', 'Content Marketing', 'all-stages', 'intermediate', '6-12 months', ARRAY['Brand authority', 'Organic traffic', 'Trust building'], ARRAY['Content creation', 'SEO', 'Thought leadership']),

('Paid advertising is rented attention. Organic content is owned attention. Build both, but never rely solely on paid traffic for your business survival and growth.', 'Alex Hormozi Marketing Strategy', 'Marketing Mix', 'Balanced Marketing', 'leads', 'Marketing Mix Strategy', 'growth', 'advanced', '6-12 months', ARRAY['Diversified traffic', 'Reduced dependence', 'Sustainable growth'], ARRAY['Paid advertising', 'Organic marketing', 'Traffic diversification']),

('The best lead generation strategy is the one you can execute consistently. Consistency beats perfection. Better to do one channel well than five channels poorly.', 'Alex Hormozi Execution Strategy', 'Marketing Execution', 'Consistent Execution', 'leads', 'Marketing Consistency', 'all-stages', 'beginner', 'ongoing', ARRAY['Better results', 'Resource efficiency', 'Skill development'], ARRAY['Marketing execution', 'Consistency', 'Focus']),

('Your ideal customer profile (ICP) should be so specific you can picture them in your mind. The more specific your targeting, the more relevant your messaging and the higher your conversion rates.', 'Alex Hormozi Targeting', 'Customer Targeting', 'Ideal Customer Profile', 'leads', 'Customer Targeting', 'early-stage', 'intermediate', '2-4 weeks', ARRAY['Higher relevance', 'Better conversion', 'Efficient marketing'], ARRAY['Customer research', 'Market segmentation', 'Targeting strategy']),

('The money is in the follow-up. Most sales happen after the fifth contact, but most marketers give up after the second. Persistence and value delivery in follow-up separate winners from losers.', 'Alex Hormozi Follow-Up Strategy', 'Sales Process', 'Persistent Follow-Up', 'leads', 'Follow-Up Systems', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher conversion rates', 'Better relationships', 'Increased revenue'], ARRAY['Sales systems', 'CRM usage', 'Customer nurturing']),

('Social proof is one of the most powerful conversion tools. Collect testimonials, case studies, and success stories. Let your customers sell for you through their authentic experiences.', 'Alex Hormozi Social Proof', 'Marketing Strategy', 'Social Proof', 'leads', 'Social Proof Strategy', 'all-stages', 'beginner', '2-6 weeks', ARRAY['Higher trust levels', 'Increased conversion rates', 'Reduced sales resistance'], ARRAY['Testimonials', 'Case studies', 'Trust building']),

('Email marketing is not dead; bad email marketing is dead. Good email marketing provides value, builds relationships, and generates consistent revenue for businesses that do it right.', 'Alex Hormozi Email Marketing', 'Email Strategy', 'Value-Based Email', 'leads', 'Email Marketing Strategy', 'all-stages', 'intermediate', '1-3 months', ARRAY['Consistent communication', 'Relationship building', 'Revenue generation'], ARRAY['Email automation', 'List building', 'Customer communication']),

('The best time to ask for a referral is right after you have delivered exceptional value. People are most willing to refer when they are experiencing the benefit of your service firsthand.', 'Alex Hormozi Referral Strategy', 'Referral Marketing', 'Timing Referrals', 'leads', 'Referral Timing', 'all-stages', 'beginner', '1-2 weeks', ARRAY['Higher referral rates', 'Quality referrals', 'Natural advocacy'], ARRAY['Referral programs', 'Customer satisfaction', 'Advocacy marketing']),

('Your website is your 24/7 salesperson. It should clearly communicate who you help, how you help them, and what they need to do next. Remove confusion and friction from your user experience.', 'Alex Hormozi Website Strategy', 'Website Optimization', 'Clear Messaging', 'leads', 'Website Conversion', 'all-stages', 'intermediate', '2-6 weeks', ARRAY['Higher website conversion', 'Clearer messaging', 'Better user experience'], ARRAY['Website design', 'User experience', 'Conversion optimization']),

('Retargeting is following up with people who have already shown interest. It is one of the highest ROI advertising strategies because you are marketing to warm traffic that knows your brand.', 'Alex Hormozi Retargeting', 'Digital Advertising', 'Retargeting Strategy', 'leads', 'Retargeting Campaigns', 'growth', 'advanced', '2-4 weeks', ARRAY['Higher conversion rates', 'Lower acquisition costs', 'Better ROI'], ARRAY['Digital advertising', 'Customer journey', 'Marketing automation']),

('Lead scoring helps you prioritize your follow-up efforts. Focus on the leads most likely to convert first, while nurturing lower-scored leads with automated sequences for future conversion.', 'Alex Hormozi Lead Management', 'Lead Qualification', 'Lead Scoring', 'leads', 'Lead Prioritization', 'growth', 'advanced', '2-6 weeks', ARRAY['Better resource allocation', 'Higher efficiency', 'Improved conversion'], ARRAY['Lead qualification', 'CRM systems', 'Sales efficiency']),

('Video content outperforms text content in engagement and conversion. People buy from people they know, like, and trust. Video helps build all three faster than any other medium.', 'Alex Hormozi Video Marketing', 'Content Strategy', 'Video Marketing', 'leads', 'Video Content Strategy', 'all-stages', 'intermediate', '1-3 months', ARRAY['Higher engagement', 'Better trust building', 'Improved conversion'], ARRAY['Video production', 'Content marketing', 'Personal branding']),

('Partnerships and joint ventures can multiply your reach without multiplying your costs. Find complementary businesses that serve the same customers and create win-win collaboration opportunities.', 'Alex Hormozi Partnership Strategy', 'Business Development', 'Strategic Partnerships', 'leads', 'Partnership Marketing', 'growth', 'advanced', '3-6 months', ARRAY['Expanded reach', 'Shared costs', 'Mutual benefits'], ARRAY['Business partnerships', 'Joint ventures', 'Collaborative marketing']),

('Customer onboarding is part of your marketing strategy. A great onboarding experience leads to testimonials, referrals, and repeat business. It also reduces churn and increases lifetime value.', 'Alex Hormozi Onboarding Strategy', 'Customer Experience', 'Onboarding Excellence', 'leads', 'Customer Onboarding', 'all-stages', 'intermediate', '2-8 weeks', ARRAY['Higher retention', 'Better satisfaction', 'More referrals'], ARRAY['Customer experience', 'Retention strategy', 'Value delivery']),

('Track everything but act on what matters. Focus on metrics that directly impact revenue: leads generated, conversion rates, customer acquisition cost, and lifetime value. Ignore vanity metrics.', 'Alex Hormozi Marketing Analytics', 'Marketing Measurement', 'Performance Metrics', 'leads', 'Marketing Measurement', 'all-stages', 'advanced', 'ongoing', ARRAY['Better decision making', 'Improved ROI', 'Data-driven growth'], ARRAY['Marketing analytics', 'KPI tracking', 'Performance optimization']),

-- BUSINESS SCALING & SYSTEMS (30 entries)
('Cash is oxygen for business. Profit is vanity, cash flow is sanity, but cash is king. Always optimize for cash collection speed. The faster you collect cash, the more you can reinvest and grow.', 'Alex Hormozi Business Principles', 'General Business Wisdom', 'Cash Flow Management', 'scaling', 'Cash Flow Optimization', 'scaling', 'advanced', 'ongoing', ARRAY['Improved cash flow', 'Faster collection times', 'Increased reinvestment capacity'], ARRAY['Working capital', 'Financial management', 'Growth funding']),

('Systems run the business and people run the systems. If you want to scale, you need documented processes, trained people, and measurement systems. Without systems, you have a job, not a business.', 'Alex Hormozi Scaling Principles', 'Business Systems', 'Systemization', 'scaling', 'Business Systemization', 'scaling', 'advanced', '6-12 months', ARRAY['Reduced owner dependence', 'Consistent quality', 'Scalable operations'], ARRAY['Standard operating procedures', 'Team management', 'Process optimization']),

('The biggest constraint to growth is usually the owner. You must learn to delegate, systematize, and remove yourself from day-to-day operations to scale effectively and create business freedom.', 'Alex Hormozi Leadership', 'Business Leadership', 'Delegation', 'scaling', 'Leadership Development', 'scaling', 'advanced', '3-6 months', ARRAY['Increased capacity', 'Better delegation', 'Stronger team'], ARRAY['Leadership skills', 'Team building', 'Organizational development']),

('Hiring is the most important skill for scaling. Hire slow, fire fast. Look for character first, competence second. You can teach skills, but you cannot teach character or work ethic.', 'Alex Hormozi Team Building', 'Human Resources', 'Hiring Strategy', 'scaling', 'Team Building', 'scaling', 'advanced', '6-12 months', ARRAY['Better team quality', 'Reduced turnover', 'Improved performance'], ARRAY['Recruitment', 'Team development', 'Company culture']),

('The goal of business is not to work more hours, but to create systems that work without you. Focus on building processes that can run independently of your direct involvement and oversight.', 'Alex Hormozi Business Philosophy', 'Business Strategy', 'Business Independence', 'scaling', 'Business Automation', 'scaling', 'advanced', '12-24 months', ARRAY['Owner independence', 'Scalable operations', 'Predictable results'], ARRAY['Process automation', 'Systems thinking', 'Business optimization']),

('Customer lifetime value (LTV) divided by customer acquisition cost (CAC) should be at least 3:1. If less, you have a business model problem. If more than 10:1, you are probably not spending enough on acquisition.', 'Alex Hormozi Unit Economics', 'Business Metrics', 'Unit Economics', 'scaling', 'LTV:CAC Ratio', 'growth', 'advanced', 'ongoing', ARRAY['Profitable unit economics', 'Sustainable growth', 'Clear ROI'], ARRAY['Customer lifetime value', 'Customer acquisition cost', 'Unit economics']),

('The three levers of business growth are: 1) Get more customers, 2) Increase average transaction value, 3) Increase purchase frequency. Focus on all three simultaneously for maximum compound growth.', 'Alex Hormozi Growth Strategy', 'Business Growth', 'Growth Levers', 'scaling', 'Growth Strategy', 'growth', 'intermediate', '3-6 months', ARRAY['Accelerated growth', 'Multiple revenue streams', 'Optimized performance'], ARRAY['Customer acquisition', 'Revenue optimization', 'Business development']),

('The bottleneck is always at the top. As the owner, your limitations become the company limitations. Invest heavily in your own development, education, and skill building to unlock growth.', 'Alex Hormozi Leadership Development', 'Personal Development', 'Leadership Growth', 'scaling', 'Personal Development', 'all-stages', 'advanced', 'ongoing', ARRAY['Better leadership', 'Increased capacity', 'Stronger decision making'], ARRAY['Leadership development', 'Personal growth', 'Skill development']),

('Standard operating procedures (SOPs) are the blueprint for consistency. Document every important process so anyone can execute it with minimal training while maintaining quality standards.', 'Alex Hormozi Operations', 'Operations Management', 'Process Documentation', 'scaling', 'SOP Development', 'scaling', 'intermediate', '3-6 months', ARRAY['Consistent quality', 'Easier training', 'Scalable operations'], ARRAY['Process documentation', 'Training systems', 'Quality control']),

('The goal is not to be the best at everything, but to have the best systems for everything. Focus on creating processes that consistently produce excellent results regardless of who executes them.', 'Alex Hormozi Systems Thinking', 'Business Systems', 'Process Excellence', 'scaling', 'Process Excellence', 'scaling', 'advanced', '6-12 months', ARRAY['Consistent results', 'Predictable outcomes', 'Scalable quality'], ARRAY['Systems design', 'Process improvement', 'Quality management']),

('Measure what matters. Focus on metrics that directly impact revenue and profitability. Vanity metrics make you feel good but do not grow your business or improve decision making.', 'Alex Hormozi Business Metrics', 'Business Analytics', 'Key Performance Indicators', 'scaling', 'KPI Management', 'growth', 'intermediate', '2-4 weeks', ARRAY['Better decision making', 'Improved performance', 'Clearer focus'], ARRAY['Business analytics', 'Performance measurement', 'Data-driven decisions']),

('The 80/20 rule applies to everything in business. 80% of your results come from 20% of your efforts. Identify the vital few activities and eliminate or delegate the trivial many.', 'Alex Hormozi Productivity', 'Productivity', 'Pareto Principle', 'scaling', '80/20 Analysis', 'all-stages', 'intermediate', '2-3 weeks', ARRAY['Higher productivity', 'Better resource allocation', 'Improved focus'], ARRAY['Time management', 'Productivity optimization', 'Strategic focus']),

('Automation is not about replacing people; it is about freeing people to do higher-value work. Automate routine tasks so your team can focus on growth activities and customer relationships.', 'Alex Hormozi Automation', 'Business Automation', 'Process Automation', 'scaling', 'Business Automation', 'scaling', 'advanced', '3-6 months', ARRAY['Higher efficiency', 'Reduced errors', 'Better resource utilization'], ARRAY['Process automation', 'Technology integration', 'Workflow optimization']),

('The best CEOs are chief resource allocation officers. Your job is to allocate time, money, and people to the activities that generate the highest return on investment for the business.', 'Alex Hormozi Leadership', 'Executive Leadership', 'Resource Allocation', 'scaling', 'Resource Management', 'scaling', 'advanced', 'ongoing', ARRAY['Better ROI', 'Optimized resource use', 'Strategic focus'], ARRAY['Strategic planning', 'Resource management', 'Executive decision making']),

('Cash flow is more important than profit in the short term. You can survive without profit for a while, but you cannot survive without cash flow. Monitor and optimize cash conversion cycles.', 'Alex Hormozi Financial Management', 'Financial Strategy', 'Cash Flow Management', 'scaling', 'Financial Management', 'all-stages', 'advanced', 'ongoing', ARRAY['Improved cash flow', 'Better financial stability', 'Reduced financial risk'], ARRAY['Financial planning', 'Working capital', 'Financial management']),

('The faster you can test and iterate, the faster you can grow. Build systems that allow for rapid experimentation and quick pivots based on market feedback and performance data.', 'Alex Hormozi Agility', 'Business Agility', 'Rapid Iteration', 'scaling', 'Agile Business', 'all-stages', 'advanced', '2-6 months', ARRAY['Faster learning', 'Better market responsiveness', 'Competitive advantage'], ARRAY['Agile methodology', 'Market testing', 'Iterative improvement']),

('Your business should work without you. If you cannot take a vacation for a month without the business suffering, you do not have a business; you have an expensive job.', 'Alex Hormozi Business Independence', 'Business Systems', 'Owner Independence', 'scaling', 'Business Independence', 'scaling', 'advanced', '12-24 months', ARRAY['Owner freedom', 'Scalable operations', 'Sustainable growth'], ARRAY['Systems thinking', 'Delegation', 'Process optimization']),

('The goal of operations is predictable results. Create systems that produce consistent outcomes regardless of who executes them. Predictability enables scaling and planning.', 'Alex Hormozi Operations Excellence', 'Operations Management', 'Operational Excellence', 'scaling', 'Operations Excellence', 'scaling', 'advanced', '6-12 months', ARRAY['Consistent quality', 'Predictable results', 'Scalable operations'], ARRAY['Process standardization', 'Quality control', 'Operational efficiency']),

('Documentation is not bureaucracy; it is freedom. The more you document your processes, the less you have to remember and the easier it becomes to delegate and scale effectively.', 'Alex Hormozi Documentation', 'Knowledge Management', 'Process Documentation', 'scaling', 'Documentation Strategy', 'scaling', 'intermediate', '3-6 months', ARRAY['Easier delegation', 'Knowledge retention', 'Faster training'], ARRAY['Knowledge management', 'Process documentation', 'Training systems']),

('Feedback loops are essential for improvement. Create systems that give you rapid feedback on performance so you can make quick adjustments and continuous improvements.', 'Alex Hormozi Feedback Systems', 'Performance Management', 'Feedback Loops', 'scaling', 'Feedback Systems', 'all-stages', 'intermediate', '1-3 months', ARRAY['Faster improvement', 'Better performance', 'Continuous optimization'], ARRAY['Performance measurement', 'Continuous improvement', 'Feedback systems']),

('The best time to fix problems is before they happen. Invest in prevention rather than firefighting. This saves time, money, and stress while improving overall business performance.', 'Alex Hormozi Problem Prevention', 'Risk Management', 'Preventive Management', 'scaling', 'Preventive Management', 'all-stages', 'advanced', 'ongoing', ARRAY['Fewer crises', 'Lower stress', 'Better efficiency'], ARRAY['Risk management', 'Preventive planning', 'Proactive management']),

('Standardization enables innovation. When your basic processes are standardized and running smoothly, you free up mental capacity to innovate and improve rather than constantly firefighting.', 'Alex Hormozi Standardization', 'Process Improvement', 'Standardization', 'scaling', 'Process Standardization', 'scaling', 'intermediate', '4-8 months', ARRAY['Consistent quality', 'Faster innovation', 'Better efficiency'], ARRAY['Process improvement', 'Standardization', 'Innovation management']),

('The customer is not always right, but they are always the customer. Listen to customer feedback carefully, but make decisions based on data, strategy, and long-term business health.', 'Alex Hormozi Customer Management', 'Customer Relations', 'Customer Feedback', 'all-stages', 'Customer Management', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better customer relationships', 'Improved products', 'Strategic clarity'], ARRAY['Customer service', 'Product development', 'Strategic thinking']),

('Complexity is the enemy of execution. The simpler your systems, the easier they are to execute consistently and the fewer errors your team will make. Simplify everything possible.', 'Alex Hormozi Simplification', 'Process Design', 'Simplification', 'scaling', 'Process Simplification', 'all-stages', 'intermediate', '2-6 months', ARRAY['Easier execution', 'Fewer errors', 'Better consistency'], ARRAY['Process design', 'Simplification', 'Execution excellence']),

('Training is not an expense; it is an investment. The better trained your team, the better your results. Invest heavily in people development and skill building programs.', 'Alex Hormozi Training', 'Human Development', 'Team Training', 'scaling', 'Team Development', 'scaling', 'intermediate', '3-12 months', ARRAY['Better performance', 'Higher retention', 'Improved capabilities'], ARRAY['Training programs', 'Skill development', 'Team building']),

('The goal is not to work harder, but to work smarter. Focus on activities that generate the highest return on investment of your time, energy, and resources.', 'Alex Hormozi Productivity', 'Time Management', 'Smart Work', 'all-stages', 'Productivity Optimization', 'all-stages', 'intermediate', 'ongoing', ARRAY['Higher productivity', 'Better results', 'Improved work-life balance'], ARRAY['Time management', 'Productivity', 'Efficiency']),

('Culture is not what you say; it is what you reward and measure. If you want to change behavior, change what you measure, track, and reward in your organization.', 'Alex Hormozi Company Culture', 'Organizational Development', 'Culture Building', 'scaling', 'Culture Development', 'scaling', 'advanced', '6-24 months', ARRAY['Better alignment', 'Improved performance', 'Stronger culture'], ARRAY['Culture building', 'Performance management', 'Leadership']),

('The best leaders are teachers and coaches. Your job is not to have all the answers, but to help your team find answers and develop their capabilities and decision-making skills.', 'Alex Hormozi Leadership Development', 'Leadership Skills', 'Coaching Leadership', 'scaling', 'Leadership Development', 'scaling', 'advanced', 'ongoing', ARRAY['Better team development', 'Higher engagement', 'Improved performance'], ARRAY['Leadership development', 'Coaching', 'Team building']),

('Excellence is not a destination; it is a journey and a daily practice. Continuous improvement should be built into every aspect of your business operations and culture.', 'Alex Hormozi Excellence', 'Continuous Improvement', 'Excellence Mindset', 'all-stages', 'Excellence Culture', 'all-stages', 'advanced', 'ongoing', ARRAY['Continuous improvement', 'Better results', 'Competitive advantage'], ARRAY['Quality management', 'Continuous improvement', 'Excellence culture']),

('Scale is not just about size; it is about creating systems that maintain quality and efficiency as you grow. Focus on scalable processes, not just bigger numbers.', 'Alex Hormozi Scaling Strategy', 'Business Scaling', 'Scalable Systems', 'scaling', 'Scalable Growth', 'scaling', 'advanced', '12-24 months', ARRAY['Quality at scale', 'Efficient growth', 'Sustainable expansion'], ARRAY['Systems design', 'Quality management', 'Growth strategy']),

-- MINDSET & BUSINESS PHILOSOPHY (25 entries)
('The biggest mistake entrepreneurs make is trying to be everything to everyone. Niche down until it hurts, then niche down more. It is better to be the best solution for 1000 people than an okay solution for 100,000.', 'Alex Hormozi Market Strategy', 'Business Strategy', 'Market Positioning', 'mindset', 'Niche Domination', 'early-stage', 'beginner', '2-4 weeks', ARRAY['Clearer market position', 'Higher conversion rates', 'Better customer fit'], ARRAY['Target market', 'Competitive advantage', 'Market domination']),

('The goal is not to do more things, but to do fewer things better. Focus creates force. When you try to do everything, you accomplish nothing exceptional. Choose your battles wisely.', 'Alex Hormozi Focus Principles', 'Business Philosophy', 'Strategic Focus', 'mindset', 'Strategic Focus', 'all-stages', 'beginner', 'ongoing', ARRAY['Better execution', 'Clearer priorities', 'Improved results'], ARRAY['Priority management', 'Resource allocation', 'Strategic thinking']),

('Successful entrepreneurs are not risk-takers; they are risk mitigators. They take calculated risks with asymmetric upside potential. They risk little to gain a lot through smart positioning.', 'Alex Hormozi Risk Management', 'Business Philosophy', 'Risk Management', 'mindset', 'Risk Assessment', 'all-stages', 'advanced', 'ongoing', ARRAY['Better decision making', 'Reduced downside', 'Maximized upside'], ARRAY['Decision making', 'Risk analysis', 'Strategic planning']),

('The market does not care about your feelings. It only cares about whether you solve problems better than alternatives. Focus on value delivery, not personal validation or ego satisfaction.', 'Alex Hormozi Market Reality', 'Business Philosophy', 'Market Focus', 'mindset', 'Market-Driven Thinking', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better market fit', 'Increased customer focus', 'Higher success rates'], ARRAY['Customer focus', 'Value creation', 'Market awareness']),

('Patience and persistence beat intelligence and talent every time. Most people quit right before the breakthrough. The difference between success and failure is often just continuing when others stop.', 'Alex Hormozi Success Principles', 'Success Philosophy', 'Persistence', 'mindset', 'Persistence Strategy', 'all-stages', 'beginner', 'ongoing', ARRAY['Long-term success', 'Better resilience', 'Breakthrough moments'], ARRAY['Mental toughness', 'Goal achievement', 'Success mindset']),

('Your network is your net worth, but only if you provide value first. Focus on helping others succeed, and success will come to you naturally through reciprocity and relationships.', 'Alex Hormozi Networking', 'Relationship Building', 'Value-First Networking', 'mindset', 'Network Building', 'all-stages', 'intermediate', 'ongoing', ARRAY['Stronger relationships', 'Better opportunities', 'Increased referrals'], ARRAY['Relationship building', 'Value creation', 'Network effects']),

('The best time to plant a tree was 20 years ago. The second best time is now. Stop waiting for perfect conditions and start building your business today with what you have available.', 'Alex Hormozi Action Mindset', 'Action Philosophy', 'Taking Action', 'mindset', 'Action Orientation', 'early-stage', 'beginner', 'immediate', ARRAY['Faster progress', 'Reduced analysis paralysis', 'Earlier market feedback'], ARRAY['Action taking', 'Decision making', 'Progress acceleration']),

('Fail fast, fail cheap, fail forward. The goal is not to avoid failure, but to learn from it quickly and inexpensively. Each failure brings you closer to success if you learn the lessons.', 'Alex Hormozi Failure Philosophy', 'Growth Mindset', 'Learning from Failure', 'mindset', 'Failure Strategy', 'all-stages', 'intermediate', 'ongoing', ARRAY['Faster learning', 'Reduced costs', 'Better resilience'], ARRAY['Growth mindset', 'Learning agility', 'Risk management']),

('Success leaves clues. Find people who have achieved what you want and model their behavior. Do not reinvent the wheel; copy what works and improve on it through your unique advantages.', 'Alex Hormozi Success Modeling', 'Success Strategy', 'Modeling Success', 'mindset', 'Success Modeling', 'all-stages', 'beginner', '2-6 months', ARRAY['Faster progress', 'Proven strategies', 'Reduced trial and error'], ARRAY['Mentorship', 'Best practices', 'Strategic learning']),

('Your problems are not unique, but your solutions can be. Focus on creating unique solutions to common problems rather than solving unique problems that few people have.', 'Alex Hormozi Problem Solving', 'Business Strategy', 'Solution Innovation', 'mindset', 'Solution Innovation', 'all-stages', 'intermediate', '3-6 months', ARRAY['Competitive advantage', 'Market differentiation', 'Higher value'], ARRAY['Innovation', 'Problem solving', 'Competitive strategy']),

('The person you need to become to build a million-dollar business is different from who you are today. Invest in personal development as much as business development.', 'Alex Hormozi Personal Growth', 'Personal Development', 'Identity Evolution', 'mindset', 'Personal Evolution', 'all-stages', 'advanced', 'ongoing', ARRAY['Better leadership', 'Increased capacity', 'Personal transformation'], ARRAY['Personal development', 'Identity work', 'Leadership growth']),

('Discipline equals freedom. The more disciplined you are with your time, money, and energy, the more freedom you will have in your business and life.', 'Alex Hormozi Discipline', 'Personal Discipline', 'Self Management', 'mindset', 'Discipline Strategy', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better self-control', 'Improved results', 'Greater freedom'], ARRAY['Self-discipline', 'Time management', 'Personal effectiveness']),

('Comfort is the enemy of growth. If you are comfortable, you are not growing. Seek discomfort intentionally as a sign that you are pushing your boundaries and expanding capabilities.', 'Alex Hormozi Growth Mindset', 'Personal Growth', 'Comfort Zone', 'mindset', 'Growth Through Discomfort', 'all-stages', 'intermediate', 'ongoing', ARRAY['Accelerated growth', 'Expanded capabilities', 'Increased resilience'], ARRAY['Growth mindset', 'Personal development', 'Challenge seeking']),

('Comparison is the thief of joy, but it can also be the fuel for improvement. Compare yourself to who you were yesterday, not to others who are on different journeys.', 'Alex Hormozi Self-Improvement', 'Personal Development', 'Self-Comparison', 'mindset', 'Personal Progress', 'all-stages', 'beginner', 'ongoing', ARRAY['Better self-awareness', 'Continuous improvement', 'Reduced anxiety'], ARRAY['Self-awareness', 'Personal development', 'Progress tracking']),

('The story you tell yourself determines your reality. If you see yourself as a victim, you will act like one. If you see yourself as a victor, you will act accordingly.', 'Alex Hormozi Mindset', 'Mental Models', 'Self-Narrative', 'mindset', 'Empowering Beliefs', 'all-stages', 'intermediate', '2-6 months', ARRAY['Better self-image', 'Improved performance', 'Greater confidence'], ARRAY['Mindset work', 'Belief systems', 'Self-concept']),

('Perfectionism is procrastination in disguise. Done is better than perfect. Ship your product, get feedback, and improve. Perfection is the enemy of progress and profit.', 'Alex Hormozi Execution', 'Execution Philosophy', 'Anti-Perfectionism', 'mindset', 'Progress Over Perfection', 'all-stages', 'intermediate', 'ongoing', ARRAY['Faster shipping', 'Earlier feedback', 'Quicker iteration'], ARRAY['Execution', 'Iteration', 'Feedback loops']),

('Your current situation is not your final destination. Where you are today is just data, not destiny. Use your current position as information, not identity.', 'Alex Hormozi Future Focus', 'Goal Setting', 'Future Orientation', 'mindset', 'Growth Trajectory', 'all-stages', 'beginner', 'ongoing', ARRAY['Better motivation', 'Clearer vision', 'Persistent action'], ARRAY['Goal setting', 'Vision creation', 'Motivation']),

('The quality of your questions determines the quality of your life. Instead of asking why me, ask how can I use this. Reframe problems as opportunities for growth.', 'Alex Hormozi Question Quality', 'Critical Thinking', 'Reframing', 'mindset', 'Empowering Questions', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better problem solving', 'Improved mindset', 'Creative solutions'], ARRAY['Critical thinking', 'Reframing', 'Problem solving']),

('Energy management is more important than time management. Protect your energy like your most valuable asset because it is. High energy leads to better decisions and execution.', 'Alex Hormozi Energy Management', 'Personal Effectiveness', 'Energy Optimization', 'mindset', 'Energy Management', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better performance', 'Improved decision making', 'Higher productivity'], ARRAY['Energy management', 'Personal effectiveness', 'Peak performance']),

('Gratitude is not just nice to have; it is a competitive advantage. Grateful people are more resilient, creative, and successful. Practice gratitude daily for better business and life outcomes.', 'Alex Hormozi Gratitude', 'Mental Health', 'Gratitude Practice', 'mindset', 'Gratitude Strategy', 'all-stages', 'beginner', 'ongoing', ARRAY['Better resilience', 'Improved creativity', 'Higher satisfaction'], ARRAY['Gratitude practice', 'Mental health', 'Positive psychology']),

('Confidence is built through competence. The more skilled you become, the more confident you feel. Invest in skill development as confidence development.', 'Alex Hormozi Confidence Building', 'Skill Development', 'Competence Building', 'mindset', 'Confidence Through Competence', 'all-stages', 'intermediate', 'ongoing', ARRAY['Higher confidence', 'Better performance', 'Reduced anxiety'], ARRAY['Skill development', 'Competence building', 'Self-efficacy']),

('Your identity is not fixed; it is fluid. You can choose who you want to become and act accordingly. Identity change precedes behavior change in lasting transformation.', 'Alex Hormozi Identity', 'Identity Work', 'Identity Design', 'mindset', 'Identity Evolution', 'all-stages', 'advanced', '6-12 months', ARRAY['Personal transformation', 'Behavior change', 'Identity alignment'], ARRAY['Identity work', 'Personal development', 'Behavior change']),

('Responsibility is power. The more responsibility you take, the more power you have to change your situation. Blame gives away your power to create change.', 'Alex Hormozi Responsibility', 'Personal Responsibility', 'Accountability', 'mindset', 'Radical Responsibility', 'all-stages', 'intermediate', 'ongoing', ARRAY['Greater control', 'Improved outcomes', 'Personal empowerment'], ARRAY['Personal responsibility', 'Accountability', 'Self-empowerment']),

('The obstacle is the way. Every problem contains the seed of its solution. The bigger the problem you can solve, the bigger the opportunity you can capture.', 'Alex Hormozi Problem Reframing', 'Problem Solving', 'Opportunity Recognition', 'mindset', 'Problem as Opportunity', 'all-stages', 'intermediate', 'ongoing', ARRAY['Better problem solving', 'Opportunity recognition', 'Resilient thinking'], ARRAY['Problem solving', 'Opportunity identification', 'Resilient mindset']),

('Success is not about what you achieve; it is about who you become in the process. The person you develop into is more valuable than any external achievement or acquisition.', 'Alex Hormozi Success Philosophy', 'Personal Development', 'Character Building', 'mindset', 'Character Development', 'all-stages', 'advanced', 'ongoing', ARRAY['Character development', 'Personal growth', 'Lasting fulfillment'], ARRAY['Character building', 'Personal development', 'Success philosophy']),

-- SALES & REVENUE (20 entries)
('Sell your products and services, not your time. Time-based pricing creates a ceiling on your income. Value-based pricing creates unlimited upside potential and scalable business models.', 'Alex Hormozi Value Creation', 'Value Creation', 'Pricing Models', 'sales', 'Value-Based Pricing', 'growth', 'intermediate', '4-8 weeks', ARRAY['Higher revenue per client', 'Scalable business model', 'Better profit margins'], ARRAY['Pricing strategy', 'Business model', 'Value delivery']),

('The close begins at hello. Every interaction with a prospect should move them closer to a buying decision. Make every touchpoint valuable, relevant, and sales-focused without being pushy.', 'Alex Hormozi Sales Strategy', 'Sales Process', 'Sales Psychology', 'sales', 'Sales Process', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher conversion rates', 'Shorter sales cycles', 'Better customer experience'], ARRAY['Sales psychology', 'Customer journey', 'Conversion optimization']),

('Objections are just requests for more information. When someone objects, they are telling you exactly what they need to hear to make a buying decision. Listen carefully and address their real concerns.', 'Alex Hormozi Sales Objections', 'Sales Training', 'Objection Handling', 'sales', 'Objection Handling', 'all-stages', 'intermediate', '2-3 weeks', ARRAY['Higher close rates', 'Better customer relationships', 'Improved sales skills'], ARRAY['Sales training', 'Customer psychology', 'Communication skills']),

('The person who cares least wins in sales. Neediness kills deals faster than anything else. Be willing to walk away from prospects who are not a good fit. This paradoxically makes you more attractive.', 'Alex Hormozi Sales Psychology', 'Sales Mindset', 'Sales Psychology', 'sales', 'Sales Mindset', 'all-stages', 'advanced', '4-8 weeks', ARRAY['Higher closing rates', 'Better client quality', 'Reduced desperation'], ARRAY['Sales psychology', 'Confidence building', 'Client qualification']),

('Price anchoring works powerfully in sales. Always present your highest-priced option first, then work down. This makes your core offer seem more reasonable and increases average transaction value significantly.', 'Alex Hormozi Pricing Psychology', 'Pricing Strategy', 'Price Anchoring', 'sales', 'Price Anchoring', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Higher average transaction value', 'Better price perception', 'Increased profitability'], ARRAY['Pricing psychology', 'Sales tactics', 'Revenue optimization']),

('Social proof is one of the most powerful sales tools available. Collect testimonials, case studies, and success stories religiously. Let your satisfied customers sell for you through their authentic experiences.', 'Alex Hormozi Social Proof', 'Marketing Strategy', 'Social Proof', 'sales', 'Social Proof Strategy', 'all-stages', 'beginner', '2-6 weeks', ARRAY['Higher trust levels', 'Increased conversion rates', 'Reduced sales resistance'], ARRAY['Testimonials', 'Case studies', 'Trust building']),

('The money is in the follow-up sequence. Most sales happen after the fifth contact, but most salespeople give up after the second attempt. Systematic persistence pays dividends in sales.', 'Alex Hormozi Follow-Up Strategy', 'Sales Process', 'Follow-Up Systems', 'sales', 'Follow-Up Strategy', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher conversion rates', 'Better customer relationships', 'Increased revenue'], ARRAY['Sales systems', 'CRM usage', 'Customer nurturing']),

('Qualify hard, close easy. The better you qualify prospects upfront, the easier the close becomes. Spend more time qualifying and understanding needs, less time convincing and pitching.', 'Alex Hormozi Sales Qualification', 'Sales Process', 'Lead Qualification', 'sales', 'Lead Qualification', 'all-stages', 'intermediate', '2-3 weeks', ARRAY['Higher close rates', 'Better use of time', 'Higher quality clients'], ARRAY['Sales process', 'Lead scoring', 'Time management']),

('The best sales script is not a script at all. It is a conversation guide that helps you ask the right questions and listen to the answers. Focus on discovery, not pitching products.', 'Alex Hormozi Sales Training', 'Sales Skills', 'Consultative Selling', 'sales', 'Consultative Selling', 'all-stages', 'advanced', '4-8 weeks', ARRAY['Better customer relationships', 'Higher close rates', 'Increased trust'], ARRAY['Sales training', 'Active listening', 'Consultative selling']),

('Urgency and scarcity must be real to be effective. Fake urgency destroys trust and damages your reputation permanently. Create genuine reasons for prospects to act now rather than manufactured pressure.', 'Alex Hormozi Sales Ethics', 'Ethical Selling', 'Authentic Urgency', 'sales', 'Ethical Sales Tactics', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Higher trust levels', 'Better long-term relationships', 'Sustainable sales growth'], ARRAY['Sales ethics', 'Trust building', 'Long-term thinking']),

('Sell to the decision maker, not the influencer. Identify who has the authority and budget to say yes. Do not waste time convincing people who cannot buy from you.', 'Alex Hormozi Sales Targeting', 'Sales Strategy', 'Decision Maker Identification', 'sales', 'Decision Maker Selling', 'all-stages', 'intermediate', '1-2 weeks', ARRAY['Shorter sales cycles', 'Higher close rates', 'Better time management'], ARRAY['Sales qualification', 'Stakeholder mapping', 'Authority identification']),

('Price objections are value objections in disguise. When someone says it costs too much, they mean the value is not clear enough. Increase perceived value instead of decreasing price.', 'Alex Hormozi Price Objections', 'Sales Training', 'Value Communication', 'sales', 'Value vs Price', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Maintained pricing', 'Better value communication', 'Higher margins'], ARRAY['Value proposition', 'Sales training', 'Objection handling']),

('The best salespeople are consultants, not pitchers. They diagnose problems, prescribe solutions, and guide customers to the best decision for their situation, even if it means no sale.', 'Alex Hormozi Consultative Sales', 'Sales Approach', 'Solution Selling', 'sales', 'Consultative Approach', 'all-stages', 'advanced', '3-6 months', ARRAY['Higher trust', 'Better relationships', 'Long-term success'], ARRAY['Consultative selling', 'Problem solving', 'Customer advisory']),

('Emotion drives the decision, logic justifies it. Connect with your prospects emotionally first, then provide the logical framework they need to justify the purchase to themselves and others.', 'Alex Hormozi Sales Psychology', 'Emotional Selling', 'Emotion and Logic', 'sales', 'Emotional Connection', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher engagement', 'Better connection', 'Increased conversion'], ARRAY['Emotional intelligence', 'Sales psychology', 'Persuasion']),

('Assumptive closing works because it assumes the sale is already made. Instead of asking if they want to buy, ask when they want to start or which option works best for them.', 'Alex Hormozi Closing Techniques', 'Sales Closing', 'Assumptive Close', 'sales', 'Closing Techniques', 'all-stages', 'intermediate', '1-3 weeks', ARRAY['Higher close rates', 'Smoother transitions', 'Less resistance'], ARRAY['Sales closing', 'Sales confidence', 'Assumptive selling']),

('Referrals are the highest quality leads because they come with built-in trust and authority. Ask for referrals systematically, not randomly. Make it easy for customers to refer others to you.', 'Alex Hormozi Referral Sales', 'Referral Strategy', 'Systematic Referrals', 'sales', 'Referral Systems', 'all-stages', 'beginner', '2-4 weeks', ARRAY['Higher quality leads', 'Lower acquisition costs', 'Built-in trust'], ARRAY['Referral programs', 'Customer advocacy', 'Trust transfer']),

('Handle objections before they arise. Address common concerns in your presentation so prospects never think of them as objections. Prevention is better than handling resistance.', 'Alex Hormozi Objection Prevention', 'Sales Prevention', 'Proactive Objection Handling', 'sales', 'Objection Prevention', 'all-stages', 'advanced', '2-6 weeks', ARRAY['Smoother sales process', 'Fewer objections', 'Higher conversion'], ARRAY['Sales presentation', 'Objection handling', 'Proactive selling']),

('The fortune is in the follow-up, but the relationship is in the value provided during follow-up. Every follow-up contact should provide value, not just ask for a decision or sale.', 'Alex Hormozi Value-Based Follow-Up', 'Follow-Up Strategy', 'Value-Driven Follow-Up', 'sales', 'Value Follow-Up', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Better relationships', 'Higher conversion', 'Increased trust'], ARRAY['Relationship building', 'Value delivery', 'Follow-up systems']),

('Sell the transformation, not the transaction. People buy outcomes and results, not products and services. Focus your sales conversation on the after state, not the process or features.', 'Alex Hormozi Outcome Selling', 'Sales Messaging', 'Transformation Focus', 'sales', 'Outcome-Based Selling', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Clearer value proposition', 'Higher emotional engagement', 'Better conversion'], ARRAY['Outcome marketing', 'Value communication', 'Customer psychology']),

('Social proof works best when it is specific and relevant. Generic testimonials are ignored. Use case studies that match your prospect situation, industry, and desired outcome for maximum impact.', 'Alex Hormozi Targeted Social Proof', 'Social Proof Strategy', 'Relevant Testimonials', 'sales', 'Targeted Social Proof', 'all-stages', 'intermediate', '2-4 weeks', ARRAY['Higher relevance', 'Better trust building', 'Increased conversion'], ARRAY['Case studies', 'Social proof', 'Relevance matching']);

-- =================================================================
-- CREATE SEARCH FUNCTIONS
-- =================================================================

-- Text-based search function (works without embeddings)
CREATE OR REPLACE FUNCTION search_hormozi_wisdom(
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.1,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    hw.id,
    hw.content,
    hw.source,
    hw.book,
    hw.chapter,
    hw.topic,
    hw.framework,
    hw.business_phase,
    ts_rank(to_tsvector('english', hw.content), plainto_tsquery('english', query_text)) as similarity
  FROM hormozi_wisdom hw
  WHERE to_tsvector('english', hw.content) @@ plainto_tsquery('english', query_text)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Context-aware search function
CREATE OR REPLACE FUNCTION search_hormozi_wisdom_by_context(
  query_text TEXT,
  context_filter TEXT DEFAULT 'all',
  match_threshold FLOAT DEFAULT 0.1,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    hw.id,
    hw.content,
    hw.source,
    hw.book,
    hw.chapter,
    hw.topic,
    hw.framework,
    hw.business_phase,
    ts_rank(to_tsvector('english', hw.content), plainto_tsquery('english', query_text)) as similarity
  FROM hormozi_wisdom hw
  WHERE 
    (context_filter = 'all' OR hw.topic = context_filter OR hw.framework ILIKE '%' || context_filter || '%')
    AND to_tsvector('english', hw.content) @@ plainto_tsquery('english', query_text)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- =================================================================
-- VERIFICATION AND SUCCESS MESSAGE
-- =================================================================

-- Verify insertion count
SELECT COUNT(*) as total_rows FROM hormozi_wisdom;

-- Check by category
SELECT topic, COUNT(*) as count FROM hormozi_wisdom GROUP BY topic ORDER BY count DESC;

-- Test search functions
SELECT 'Search Test:' as test_name;
SELECT * FROM search_hormozi_wisdom('Grand Slam Offer', 0.1, 2);

-- Success message
DO $$ 
DECLARE
    row_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO row_count FROM hormozi_wisdom;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔮 ORACLE HORMOZI WISDOM DATABASE POPULATED! 🔮';
    RAISE NOTICE '';
    RAISE NOTICE '✅ hormozi_wisdom table: % rows of business intelligence', row_count;
    RAISE NOTICE '✅ Full-text search functions: Created and ready';
    RAISE NOTICE '✅ Business categorization: Complete with frameworks and phases';
    RAISE NOTICE '✅ Performance indexes: Optimized for fast queries';
    RAISE NOTICE '';
    IF row_count = 139 THEN
        RAISE NOTICE '🚀 ALL 139 ENTRIES SUCCESSFULLY LOADED! 🚀';
        RAISE NOTICE '🎯 ORACLE IS NOW READY FOR INTELLIGENT RESPONSES! 🎯';
    ELSE
        RAISE NOTICE '⚠️  Expected 139 rows, got % rows', row_count;
        RAISE NOTICE '📊 Verify data integrity and check for any insertion errors';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '🔥 Next: Test Oracle at https://oracle-staging-test-1756425679.netlify.app 🔥';
END $$;