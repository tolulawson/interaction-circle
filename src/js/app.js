const imageArray = [];
const allPromises = [];
const circleDimensions = [
  {
    radius: 55,
    quantity: 1,
    position: 0,
  },
  {
    radius: 32,
    quantity: 8,
    position: 100,
  },
  {
    radius: 29,
    quantity: 15,
    position: 166,
  },
  {
    radius: 22,
    quantity: 26,
    position: 220,
  },
];

// -- Returns array of promises.
// -- Fetches a batch of images of given size and quantity and pushes the set (array) to imageArray
function fetchImage(size, quantity, imagesArray) {
  let promises = [];
  function call(size) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://picsum.photos/${size}.jpg`,
        xhrFields: {
          responseType: 'blob',
        },
      })
        .done((data) => {
          const img = $('<img>');
          img.attr('src', window.URL.createObjectURL(data));
          resolve(img);
        })
        .fail((error) => {
          reject(error);
        });
    })
      .then((resolvedImg) => resolvedImg)
      .catch((error) => error);
  }

  for (let i = 0; i < quantity; i += 1) {
    promises.push(call(size));
  }
  Promise.all(promises)
    .then((images) => {
      imagesArray.push(images);
    });
  return promises;
}

// -- Runs a loop to fetch the different categories of images.
// -- Argument --> Array. Pushes promises into array argument
function fetchImages(collection, dimension) {
  for (let i = 0; i < dimension.length; i += 1) {
    switch (i) {
      default:
      case 0:
        collection.push(...fetchImage(dimension[0].radius * 4, dimension[0].quantity, imageArray));
        break;
      case 1:
        collection.push(...fetchImage(dimension[1].radius * 4, dimension[1].quantity, imageArray));
        break;
      case 2:
        collection.push(...fetchImage(dimension[2].radius * 4, dimension[2].quantity, imageArray));
        break;
      case 3:
        collection.push(...fetchImage(dimension[3].radius * 4, dimension[3].quantity, imageArray));
    }
  }
}

function drawCanvas(container, width, height) {
  const stage = new Konva.Stage({
    container,
    width,
    height,
    offsetX: -width / 2,
    offsetY: -height / 2,
  });
  return stage;
}

function drawCircles(radius, position, images) {
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const layer = new Konva.Layer();
  for (let i = 0; i < images.length; i += 1) {
    const angle = (360 / images.length) * i;
    const circle = new Konva.Circle({
      x: position * Math.sin(deg2rad(angle)),
      y: position * Math.cos(deg2rad(angle)),
      radius,
      fillPatternRepeat: 'no-repeat',
      fillPatternOffsetX: radius*2,
      fillPatternOffsetY: radius*2,
      fillPatternScale: {
        x: 0.5,
        y: 0.5,
      },
    });
    circle.fillPatternImage(images[i][0]);
    layer.add(circle);
  }
  return layer;
}

function start(dimension) {
  fetchImages(allPromises, dimension);

  Promise.all(allPromises)
    .then(() => {
      // imageArray.forEach((array) => {
      //   array.forEach((image) => {
      //     image.appendTo('#image');
      //   });
      // });
      $('#start-button').css('display', 'none');
      const canvasStage = drawCanvas('canvas', 500, 500);
      for (let i = 0; i < circleDimensions.length; i += 1) {
        canvasStage.add(drawCircles(dimension[i].radius, dimension[i].position, imageArray[i]));
      }
    });
}

$('#start-button').click(() => {
  start(circleDimensions);
  $('#start-button').text('Fetching images...')
});
