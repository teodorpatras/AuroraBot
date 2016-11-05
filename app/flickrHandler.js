'use strict'

const request = require('request')

const FLICKR_PHOTOS = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&tags=aurora+borealis&format=json&nojsoncallback=1'
const FLICKR_PHOTO_SIZES = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&nojsoncallback=1'
const FLICKR_PHOTO_INFO = 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&format=json&nojsoncallback=1'
const FLICKR_API_KEY = `&api_key=${process.env.FLICKR_API_KEY}`

const DEFAULT_PHOTO = 'http://www.nasa.gov/sites/default/files/thumbnails/image/20150409-10-sebastiansaarloos.jpg'
const DEFAULT_USERNAME = 'Sebastian Saarlos'

function fetchPhotoId() {
    return new Promise((resolve, reject) => {
        request(`${FLICKR_PHOTOS}${FLICKR_API_KEY}`, (err, response, body) => {
            if (err || response.statusCode != 200) { return reject(err) }
            body = JSON.parse(body)
            try {
                const photos = body.photos.photo
                const index = Math.floor(Math.random() * photos.length)
                resolve(photos[index].id)
            } catch (err) {
                console.error('Error at fetchPhotoId -- ' + err)
                reject(err)
            }
        })
    })
}

function fetchURLfor(photoId) {
    return new Promise((resolve, reject) => {
        if (!photoId) { return reject(Error('Invalid photo id!')) }
        request(`${FLICKR_PHOTO_SIZES}${FLICKR_API_KEY}&photo_id=${photoId}`, (err, response, body) => {
            if (err || response.statusCode != 200) { return reject(err) }
            body = JSON.parse(body)
            try {
                const sizes = body.sizes.size
                for (var i = 0; i < sizes.length; i ++) {
                    if (sizes[i].label == 'Large') {
                        return resolve(sizes[i].source)
                    }
                }
                resolve(sizes[sizes.length - 1].source)
            } catch (err) {
                console.error('Error at fetchURL -- ' + err)
                reject(err)
            }
        })
    })
}

function fetchUsernameFor(photoId) {
    return new Promise((resolve, reject) => {
        if (!photoId) { return reject(Error('Invalid photo id!')) }
        request(`${FLICKR_PHOTO_INFO}${FLICKR_API_KEY}&photo_id=${photoId}`, (err, response, body) => {
            if (err || response.statusCode != 200) { return reject(err) }
            body = JSON.parse(body)
            try {
                resolve(body.photo.owner.username)
            } catch (err) {
                console.error('Error at fetchUsername -- ' + err)
                reject(err)
            }
        })
    })
}

function fetchRandomPhoto(completion) {
    fetchPhotoId().then(photoId => {
        return Promise.all([fetchURLfor(photoId), fetchUsernameFor(photoId)])
    }).then(values => {
        completion(values[0], values[1])
    }).catch(reason => {
        completion(DEFAULT_PHOTO, DEFAULT_USERNAME)
    })
}

module.exports = { fetchRandomPhoto }