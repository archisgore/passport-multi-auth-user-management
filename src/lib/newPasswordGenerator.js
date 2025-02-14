import generator from 'generate-password'

export default () => {
    const newPassword = generator.generate({
        length: 20,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
    })

    console.log('Generated password:', newPassword)
    return newPassword
}
