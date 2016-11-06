'use strict'

const FINLAND_OPTION_CAM_1 = '🇫🇮 Finland #1'
const FINLAND_OPTION_CAM_2 = '🇫🇮 Finland #2'
const SWEDEN_OPTION_CAM_1 = '🇸🇪 Sweden #1'
const SWEDEN_OPTION_CAM_2 = '🇸🇪 Sweden #2'
const NORWAY_OPTION_CAM_1 = '🇳🇴 Norway #1'
const NORWAY_OPTION_CAM_2 = '🇳🇴 Norway #2'

var skyCams = [
    {
        command: FINLAND_OPTION_CAM_1,
        url: 'http://aurora.fmi.fi/public_service/latest_DYN.jpg',
        location: 'Helsinki, Finland',
        lat: 60.170477,
        lon: 24.932778
    },
    {
        command: FINLAND_OPTION_CAM_2,
        url: 'http://www.sgo.fi/Data/RealTime/Kuvat/UCL.jpg',
        location: 'Sodankylä, Finland',
        lat: 67.416001,
        lon: 26.586784
    },
    {
        command: NORWAY_OPTION_CAM_1,
        url: 'http://polaris.nipr.ac.jp/~acaurora/aurora/Tromso/latest.jpg',
        location: 'Tromsø, Norway',
        lat: 69.649979,
        lon: 18.953976
    },
    {
        command: NORWAY_OPTION_CAM_2,
        url: 'http://polaris.nipr.ac.jp/~acaurora/aurora/Longyearbyen/latest.jpg',
        location: 'Svalbard Islands, Norway',
        lat: 78.5044091,
        lon: 13.0690518
    },
        {
        command: SWEDEN_OPTION_CAM_1,
        url: 'http://uk.jokkmokk.jp/photo/nr3/latest.jpg',
        location: 'Porjus, Jokkmokk, Sweden',
        lat: 66.9592515,
        lon: 19.8130181
    },
    {
        command: SWEDEN_OPTION_CAM_2,
        url: 'http://www.aurora-service.eu/scripts/images/kiruna_aurora_sky_camera.jpg',
        location: 'Kiruna, Sweden',
        lat: 67.8537517,
        lon: 20.1863908
    }
]

module.exports = skyCams