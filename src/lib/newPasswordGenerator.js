import generator from 'generate-password'

export default () => {
    const newPassword = generator.generate({
        length: 99,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
    })

    return newPassword
}
