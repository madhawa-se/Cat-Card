let { writeFile } = require('fs');
let { join } = require('path');
let blend = require('@mapbox/blend');
let argv = require('minimist')(process.argv.slice(2));
const axios = require('axios').default;
let { CAT_URL } = require('./config.js');

let {
    greeting = 'Hello', who = 'You',
    width = 400, height = 500, color = 'Pink', size = 100,
} = argv;


const fetchImage = async ({ text, width, height, color, size }) => {
    // Fetch images and return a buffer
    const url = `${CAT_URL}/cat/says/${text}?width=${width}&height=${height}&color${color}&s=${size}`;
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}

const blend = async (...bufferConfigs) => {
    // Blend images together
    return await blend(bufferConfigs,
        { width: width * bufferConfigs.length, height: height, format: 'jpeg', });
}


const init = async () => {
    try {
        //Fetch images.Insted of waiting for each request to finish, Using parallel requests
        let [image1, image2] = await Promise.all([
            fetchImage({ text:greeting, width, height, color, size }),
            fetchImage({ text: who, width, height, color, size })
        ]);

        //Blend images
        const blendedImg = await blend([
            { buffer: image1, x: 0, y: 0 },
            { buffer: image2, x: width, y: 0 }
            // can pass any number of image buffers
        ]);

        //Write the file
        const fileOut = join(process.cwd(), `/cat-card.jpg`);
        await writeFile(fileOut, blendedImg, 'binary');
        console.log("The file was saved!");

    } catch (err) {
        console.log('Meow! error occured!', err);
    }
}


init();
