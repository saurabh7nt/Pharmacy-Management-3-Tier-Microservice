-- Pharmacy Management System - Medicine Seed Data
-- Safe to keep in git and run after cloning the repository.
-- Target table: medicines

INSERT INTO medicines (name, description, price, quantity, category, manufacturer, expiry_date, created_at, updated_at, available)
VALUES
  (
    'Paracetamol 500mg',
    'Pain reliever and fever reducer for common cold, body ache, and mild fever.',
    25.00,
    150,
    'Pain Relief',
    'Sun Pharma',
    '2027-12-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Aspirin 100mg',
    'Low-dose aspirin commonly used for pain relief and cardiac care support.',
    40.00,
    60,
    'Cardiac Care',
    'Bayer',
    '2027-09-30',
    NOW(),
    NOW(),
    true
  ),
  (
    'Amoxicillin 250mg',
    'Broad-spectrum antibiotic capsule used for bacterial infections.',
    85.50,
    80,
    'Antibiotics',
    'Cipla',
    '2027-08-15',
    NOW(),
    NOW(),
    true
  ),
  (
    'Omeprazole 20mg',
    'Proton pump inhibitor used for acidity, reflux, and ulcer support.',
    72.00,
    95,
    'Gastro',
    'Dr Reddys',
    '2027-11-20',
    NOW(),
    NOW(),
    true
  ),
  (
    'Metformin 500mg',
    'Oral antidiabetic medicine for type 2 diabetes management.',
    55.00,
    110,
    'Diabetes',
    'Glenmark',
    '2027-10-10',
    NOW(),
    NOW(),
    true
  ),
  (
    'Cetirizine 10mg',
    'Antihistamine tablet for allergy, sneezing, and itching relief.',
    18.00,
    140,
    'Allergy',
    'Mankind',
    '2027-07-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Azithromycin 500mg',
    'Antibiotic tablet used for respiratory and bacterial infections.',
    120.00,
    45,
    'Antibiotics',
    'Abbott',
    '2027-06-30',
    NOW(),
    NOW(),
    true
  ),
  (
    'Pantoprazole 40mg',
    'Acid suppression tablet for GERD and gastric irritation.',
    68.00,
    90,
    'Gastro',
    'Torrent',
    '2027-12-15',
    NOW(),
    NOW(),
    true
  ),
  (
    'Vitamin C 500mg',
    'Immunity support supplement tablet with antioxidant benefits.',
    30.00,
    200,
    'Supplements',
    'Himalaya',
    '2028-01-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Calcium + Vitamin D3',
    'Bone health supplement for calcium support and deficiency prevention.',
    95.00,
    75,
    'Supplements',
    'Shelcal',
    '2028-03-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Insulin Glargine',
    'Long-acting insulin injection for blood sugar control in diabetes.',
    650.00,
    25,
    'Diabetes',
    'Sanofi',
    '2027-05-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Levocetirizine 5mg',
    'Anti-allergy tablet used for seasonal allergic symptoms.',
    22.00,
    130,
    'Allergy',
    'Cipla',
    '2027-08-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Ibuprofen 400mg',
    'Nonsteroidal anti-inflammatory drug for pain, swelling, and fever.',
    35.00,
    100,
    'Pain Relief',
    'Abbott',
    '2027-09-15',
    NOW(),
    NOW(),
    true
  ),
  (
    'Dolo 650',
    'Paracetamol tablet widely used for fever and pain management.',
    32.00,
    180,
    'Pain Relief',
    'Micro Labs',
    '2027-12-20',
    NOW(),
    NOW(),
    true
  ),
  (
    'ORS Sachet',
    'Oral rehydration salts for dehydration and electrolyte replacement.',
    20.00,
    220,
    'Hydration',
    'Electral',
    '2028-02-28',
    NOW(),
    NOW(),
    true
  ),
  (
    'Cough Syrup DX',
    'Combination cough syrup for dry cough relief.',
    90.00,
    55,
    'Respiratory',
    'Benadryl',
    '2027-11-30',
    NOW(),
    NOW(),
    true
  ),
  (
    'Montelukast 10mg',
    'Anti-allergic tablet used in asthma and allergic rhinitis support.',
    65.00,
    70,
    'Respiratory',
    'Sun Pharma',
    '2027-10-31',
    NOW(),
    NOW(),
    true
  ),
  (
    'Salbutamol Inhaler',
    'Reliever inhaler for quick bronchospasm and asthma symptom relief.',
    180.00,
    35,
    'Respiratory',
    'Cipla',
    '2027-07-15',
    NOW(),
    NOW(),
    true
  ),
  (
    'Ondansetron 4mg',
    'Antiemetic tablet used for nausea and vomiting control.',
    48.00,
    50,
    'General',
    'Zydus',
    '2027-09-30',
    NOW(),
    NOW(),
    true
  ),
  (
    'Iron Folic Acid',
    'Supplement tablet for iron deficiency and anemia support.',
    28.00,
    160,
    'Supplements',
    'Dexorange',
    '2028-04-30',
    NOW(),
    NOW(),
    true
  );

-- Optional cleanup command if you want to reset only medicine data first:
-- DELETE FROM medicines;
