export function baseEncode(value) {
    if (value) {
        return Buffer.from(value.trim()).toString('base64');
    }
    return null;
}

export function baseDecode(value, wrap = 0) {
    if (!value) return null;

    let decodedValue = Buffer.from(value.trim(), 'base64').toString('utf-8');

    if (wrap !== 0) {
        decodedValue = decodedValue.replace(new RegExp(`(.{${wrap}})`, 'g'), '$1<br />');
    }

    return decodedValue;
}
