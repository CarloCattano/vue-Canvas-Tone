module.exports = { 
    devServer: { 
        open: process.platform === 'darwin',
        https: true,
        port:8080,
        hotOnly: false,
        } 
        }