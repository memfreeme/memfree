const imageList = [
    'https://images.unsplash.com/photo-1616071906060-1f425a639465',
    'https://images.unsplash.com/photo-1643986149937-5d0b9306dba5',
    'https://images.unsplash.com/photo-1629140476584-f10ee7810d2c',
    'https://images.unsplash.com/photo-1608501712351-a4ca8dc996fb',
    'https://images.unsplash.com/photo-1495785870240-c8456d5aeda2',
    'https://images.unsplash.com/photo-1616071906060-1f425a639465',
];

export const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageList.length);
    return imageList[randomIndex];
};
