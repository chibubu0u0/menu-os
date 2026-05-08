-- 離域 Li-Yu Menu Import
-- Compatible with the current Menu OS schema: public.menu_items
-- 這份 SQL 會清空 menu_items 的測試品項，並匯入離域菜單。
-- Supabase Dashboard → SQL Editor → New query → paste all → Run

begin;

delete from public.menu_items;

insert into public.menu_items (category, name, description, price, available, featured, sort_order)
values
  ('黑咖啡', '濃縮咖啡｜Espresso', '飲品可少冰，無提供去冰服務，甜度固定', 80, true, false, 110),
  ('黑咖啡', '美式咖啡｜Americano', '飲品可少冰，無提供去冰服務，甜度固定', 100, true, false, 120),
  ('牛奶咖啡', '卡布奇諾｜Cappuccino', '飲品可少冰，無提供去冰服務，甜度固定', 120, true, false, 130),
  ('牛奶咖啡', '拿鐵｜Latte', '飲品可少冰，無提供去冰服務，甜度固定', 120, true, false, 140),
  ('牛奶咖啡', '風味拿鐵｜Flavored Latte', '桂花 / 海鹽 / 焦糖 / 香草 / 黑糖。飲品可少冰，無提供去冰服務，甜度固定 / Osmanthus / Sea Salt / Caramel / Vanilla / Brown Sugar', 130, true, true, 150),
  ('牛奶咖啡', '摩卡咖啡｜Mocha', '飲品可少冰，無提供去冰服務，甜度固定', 120, true, false, 160),
  ('牛奶咖啡', '竹炭拿鐵｜Charcoal Latte', '飲品可少冰，無提供去冰服務，甜度固定', 140, true, false, 170),
  ('特調咖啡', '西西里咖啡｜Sicilian Coffee', '飲品可少冰，無提供去冰服務，甜度固定', 130, true, false, 180),
  ('特調咖啡', '林檎美式｜Apple Americano', '飲品可少冰，無提供去冰服務，甜度固定 / Apple coffee', 150, true, true, 190),
  ('特調咖啡', '咖啡通寧｜Coffee Tonic', '飲品可少冰，無提供去冰服務，甜度固定', 130, true, false, 200),
  ('手沖咖啡', '祕魯 庫斯科 印加古道莊園 藝伎｜Peru Cusco Inca Trail Estate Geisha', '水洗處理法｜淺焙｜T2722 Geisha 品種｜檸檬皮、柑橘、蜂蜜柚子、紅茶 / Washed Process / Light Roast / T2722 Geisha Variety / Lemon peel, citrus, honey pomelo, black tea', 160, true, true, 210),
  ('手沖咖啡', '衣索比亞 古吉 蜂｜Ethiopia Guji Bee', '紅蜜處理法｜淺焙｜Heirloom 品種｜水蜜桃、佛手柑、蜂蜜、荔枝軟糖、雞蛋花 / Red Honey Process / Light Roast / Heirloom Variety / Peach, bergamot, honey, lychee gummy, plumeria', 160, true, false, 220),
  ('手沖咖啡', '衣索比亞 西達馬 柏娜 蘇莉亞｜Ethiopia Sidama Bona Sulia', '水洗處理法｜淺焙｜Heirloom 品種｜大吉嶺紅茶、蜂蜜、佛手柑、桃子 / Washed Process / Light Roast / Heirloom Variety / Darjeeling black tea, honey, bergamot, peach', 160, true, false, 230),
  ('手沖咖啡', '衣索比亞 古吉 罕貝拉 朵拉處理廠｜Ethiopia Guji Hambela Dora Mill', '日曬處理法｜淺焙｜Heirloom 品種｜草莓、水蜜桃、藍莓果醬、玉荷包、佛手柑 / Natural Process / Light Roast / Heirloom Variety / Strawberry, peach, blueberry jam, lychee, bergamot', 160, true, false, 240),
  ('手沖咖啡', '哥倫比亞 薇拉 雲霧茉莉｜Colombia Huila Misty Jasmine', '厭氧水洗處理法｜淺中焙｜帝比卡 品種｜茉莉花、白毫銀針、奶油香、玉蘭花 / Anaerobic Washed Process / Light-Medium Roast / Typica Variety / Jasmine, Silver Needle white tea, buttery aroma, magnolia', 160, true, false, 250),
  ('手沖咖啡', '玻利維亞 明日太陽計劃 卡拉納比 南希小農｜Bolivia Tomorrow''s Sun Project Caranavi Nancy Smallholder', '水洗處理法｜中焙｜卡杜艾 品種｜柳橙、陳皮、紅茶、焦糖餅乾 / Washed Process / Medium Roast / Catuai Variety / Orange, aged tangerine peel, black tea, caramel biscuit', 160, true, false, 260),
  ('不想喝咖啡', '黑糖歐蕾｜Brown Sugar Au Lait', '飲品可少冰，無提供去冰服務，甜度固定', 140, true, false, 310),
  ('不想喝咖啡', '抹茶歐蕾｜Matcha Au Lait', '飲品可少冰，無提供去冰服務，甜度固定', 160, true, true, 320),
  ('不想喝咖啡', '可可歐蕾｜Cocoa Au Lait', '飲品可少冰，無提供去冰服務，甜度固定', 140, true, false, 330),
  ('茶飲', '蜜香烏龍｜Honey Oolong Tea', '阿里山。飲品可少冰，無提供去冰服務，甜度固定 / Alishan', 150, true, false, 340),
  ('茶飲', '黑豆小麥茶｜Black Bean & Wheat Tea', '花蓮。飲品可少冰，無提供去冰服務，甜度固定 / Hualien', 150, true, false, 350),
  ('茶飲', '蜜香紅茶｜Honey Black Tea', '花蓮。飲品可少冰，無提供去冰服務，甜度固定 / Hualien', 150, true, false, 360),
  ('氣泡飲', '蜂蜜檸檬氣泡｜Honey Lemon Sparkling', '無咖啡因。飲品可少冰，無提供去冰服務，甜度固定 / Caffeine-free', 150, true, false, 370),
  ('氣泡飲', '綜合水果氣泡｜Mixed Fruit Sparkling', '百香果、鳳梨、蘋果。飲品可少冰，無提供去冰服務，甜度固定 / Passion fruit, pineapple, apple', 150, true, false, 380),
  ('氣泡飲', '香草鳳梨氣泡｜Vanilla Pineapple Sparkling', '飲品可少冰，無提供去冰服務，甜度固定', 160, true, true, 390),
  ('氣泡飲', '接骨木蔓越莓氣泡｜Elderflower Cranberry Sparkling', '飲品可少冰，無提供去冰服務，甜度固定', 150, true, false, 400),
  ('不想喝咖啡', '楓糖歐蕾｜Maple Syrup Au Lait', '飲品可少冰，無提供去冰服務，甜度固定', 140, true, false, 410),
  ('義大利麵', '明太子燻鮭義大利麵｜Mentaiko & Smoked Salmon Pasta', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 310, true, true, 410),
  ('義大利麵', '蝦醬松阪雞義大利麵｜Shrimp Paste & Matsusaka Chicken Pasta', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 310, true, false, 420),
  ('義大利麵', '辣奶油檸檬蝦仁義大利麵｜Spicy Creamy Lemon Shrimp Pasta', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 290, true, false, 430),
  ('義大利麵', '厚切培根蛋黃義大利麵｜Carbonara (Bacon & Egg Yolk)', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 270, true, false, 440),
  ('飯食', '蒜燒松阪雞飯｜Garlic Grilled Matsusaka Chicken Rice', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 290, true, false, 450),
  ('飯食', '蒜燒蝦仁珠貝飯｜Roasted Garlic Shrimp and Scallop Rice', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 290, true, false, 460),
  ('飯食', '牛五花燒肉飯｜Grilled Beef Short Plate Rice', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 270, true, false, 470),
  ('飯食', '牛肋條抹茶咖哩飯｜Matcha Curry Rice with Beef Short Ribs', '供餐最後加點 22:30 前。口味調整請洽櫃檯', 320, true, true, 480),
  ('套餐', '飲品套餐｜Drink Set', '點主餐可加購。130 元飲品任選，可補差額更換 / Select any drink valued up to $130; pay the difference to upgrade', 109, true, false, 510),
  ('套餐', '甜點套餐｜Dessert Set', '點主餐可加購。130 元甜點 + 130 元飲品，可補差額更換 / $130 dessert + $130 drink; pay the difference to upgrade', 229, true, false, 520),
  ('想吃點甜', '椪糖布丁｜Honeycomb Toffee Pudding', null, 120, true, false, 610),
  ('想吃點甜', '巴斯克乳酪蛋糕｜Original Basque Cheesecake', null, 130, true, true, 620),
  ('想吃點甜', '提拉米蘇｜Tiramisu', '含酒精 / Contains alcohol', 180, true, false, 630),
  ('想吃點甜', '離域蘋果派｜Li-Yu Apple Pie', '附冰淇淋。招牌人氣甜點 / With ice cream', 180, true, true, 640),
  ('來點點心', '松露薯條｜Truffle Fries', null, 150, true, false, 650),
  ('來點點心', '菇菇洋芋起司鹹派｜Mushroom, Potato and Cheese Savory Pie', null, 200, true, false, 660),
  ('來點點心', '牛肉洋芋起司鹹派｜Beef, Potato and Cheese Savory Pie', null, 210, true, false, 670);

commit;