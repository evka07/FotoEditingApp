const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
    try {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };
        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);

        console.log('Watermark added correctly');

        await startApp();
    } catch (error) {
        console.log('Something went wrong... Try again');
    }
};

const addImageWatermarkToImage = async function (
    inputFile,
    outputFile,
    watermarkFile
) {
    try {
        const image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile);
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);

        console.log('Watermark added correctly');

        await startApp();
    } catch (error) {
        console.log('Something went wrong... Try again');
    }
};

const prepareOutputFilename = inputFile => {
    const filename = inputFile.split('.');
    const newName = `${filename[0]}-edited.${filename[1]}`;

    return newName;
};

const startApp = async () => {
    const answer = await inquirer.prompt([
        {
            name: 'start',
            message:
                'Hi! Welcome to "Watermark maneger". Copy your image files to "/img" folder. Then you\'ll be able to use them in the app. Are you ready?',
            type: 'confirm',
        },
    ]);

    if (!answer.start) process.exit();

    const options = await inquirer.prompt([
        {
            name: 'inputImage',
            type: 'input',
            message: 'What file do you want to mark?',
            default: 'test.jpg',
        },
        {
            name: 'editType',
            type: 'list',
            choices: [
                'Change brightness',
                'Increase contrast',
                'Make image B&W',
                'Invert image',
                'Add watermark',
            ],
        },
    ]);

    if (options.editType === 'Add watermark') {
        const watermark = await inquirer.prompt([
            {
                name: 'watermarkType',
                type: 'list',
                choices: ['Text watermark', 'Image watermark'],
            },
        ]);

        if (watermark.watermarkType === 'Text watermark') {
            const text = await inquirer.prompt([
                {
                    name: 'value',
                    type: 'input',
                    message: 'Type your watermark text:',
                },
            ]);
            options.watermarkText = text.value;

            if (fs.existsSync(`./img/${options.inputImage}`)) {
                addTextWatermarkToImage(
                    './img/' + options.inputImage,
                    './img/' + prepareOutputFilename(options.inputImage),
                    options.watermarkText
                );
            } else {
                console.log('Something went wrong... Try again');
                process.exit();
            }
        } else {
            const image = await inquirer.prompt([
                {
                    name: 'filename',
                    type: 'input',
                    message: 'Type your watermark name:',
                    default: 'logo.png',
                },
            ]);
            options.watermarkImage = image.filename;
            if (
                fs.existsSync(`./img/${options.inputImage}`) &&
                fs.existsSync(`./img/${options.watermarkImage}`)
            ) {
                addImageWatermarkToImage(
                    './img/' + options.inputImage,
                    './img/' + prepareOutputFilename(options.inputImage),
                    './img/' + options.watermarkImage
                );
            } else {
                console.log('Something went wrong... Try again');
                process.exit();
            }
        }
    } else if (options.editType === 'Change brightness') {
        const brightnessQuestion = await inquirer.prompt([
            {
                name: 'brightnessValue',
                type: 'input',
                message: 'Enter the brightnes value (max value = 1, min value = -1)',
                validate: function (value) {
                    const parsedValue = parseFloat(value);
                    return !isNaN(parsedValue);
                },
            },
        ]);
        try {
            const inputImage = await Jimp.read(`./img/${options.inputImage}`);
            const brightnessValue = parseFloat(brightnessQuestion.brightnessValue);

            if (!isNaN(brightnessValue)) {
                inputImage.brightness(brightnessValue);
                await inputImage
                    .quality(100)
                    .writeAsync(`./img/${prepareOutputFilename(options.inputImage)}`);
                console.log('Brightness changed successfully');
            } else {
                console.log('Invalid brightness value. Please enter a valid number.');
            }
            await startApp();
        } catch (error) {
            console.log('Something went wrong... Try again');
        }
    } else if (options.editType === 'Increase contrast') {
        const contrastQuestion = await inquirer.prompt([
            {
                name: 'contrastValue',
                type: 'input',
                message: 'Enter the contrast value (max value = 1, min value = -1)',
                validate: function (value) {
                    const parsedValue = parseFloat(value);
                    return !isNaN(parsedValue);
                },
            },
        ]);
        try {
            const inputImage = await Jimp.read(`./img/${options.inputImage}`);
            const contrastValue = parseFloat(contrastQuestion.contrastValue);

            if (!isNaN(contrastValue)) {
                inputImage.contrast(contrastValue);
                await inputImage
                    .quality(100)
                    .writeAsync(`./img/${prepareOutputFilename(options.inputImage)}`);
                console.log('Contrast changed successfully');
            } else {
                console.log('Invalid contrast value. Please enter a valid number.');
            }
            await startApp();
        } catch (error) {
            console.log('Something went wrong... Try again');
        }
    } else if (options.editType === 'Make image B&W') {
        try {
            const inputImage = await Jimp.read(`./img/${options.inputImage}`);
            inputImage.greyscale();
            await inputImage
                .quality(100)
                .writeAsync(`./img/${prepareOutputFilename(options.inputImage)}`);
            console.log('Colours remove successfully');
        } catch (error) {
            console.log('Something went wrong... Try again');
        }
    } else if (options.editType === 'Invert image') {
        try {
            const inputImage = await Jimp.read(`./img/${options.inputImage}`);
            inputImage.invert();
            await inputImage
                .quality(100)
                .writeAsync(`./img/${prepareOutputFilename(options.inputImage)}`);
            console.log('Colours inverted successfully');
        } catch (error) {
            console.log('Something went wrong... Try again');
        }
    }
};

startApp();