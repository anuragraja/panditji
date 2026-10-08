const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://03-prac:03-prac6268@03-prac.po5ieuj.mongodb.net/pandit_ji_ka_dhaba';

async function seedCombo() {
  await mongoose.connect(uri);
  const col = mongoose.connection.db.collection('menuitems');
  const existing = await col.findOne({ slug: 'family-meal-combo' });
  if (existing) {
    console.log('Already exists, updating...');
    await col.updateOne(
      { _id: existing._id },
      {
        $set: {
          name: 'Family Meal — Perfect for Sharing',
          hindiName: 'फैमिली मील कॉम्बो',
          description: 'Dal Tadka • Paneer Curry • 4 Butter Rotis • Jeera Rice • Salad',
          category: 'Combos',
          basePrice: 449,
          discountPrice: 449,
          tag: "CHEF'S FAMILY COMBO",
          image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85',
          foodType: 'VEG',
          preparationTime: '20-25 mins',
          available: true,
          featured: true,
          popular: true,
          todaySpecial: true,
          updatedAt: new Date()
        }
      }
    );
  } else {
    console.log('Inserting new combo...');
    await col.insertOne({
      name: 'Family Meal — Perfect for Sharing',
      hindiName: 'फैमिली मील कॉम्बो',
      slug: 'family-meal-combo',
      description: 'Dal Tadka • Paneer Curry • 4 Butter Rotis • Jeera Rice • Salad',
      category: 'Combos',
      basePrice: 449,
      discountPrice: 449,
      tag: "CHEF'S FAMILY COMBO",
      image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85',
      foodType: 'VEG',
      preparationTime: '20-25 mins',
      available: true,
      featured: true,
      popular: true,
      todaySpecial: true,
      variants: [],
      addOns: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  console.log('Successfully created/updated combo in database!');
  await mongoose.disconnect();
}

seedCombo().catch(console.error);
