export const load = ({ locals }) => {
    let user = locals.user;
    if (user && !user.isGuest) {
        if (user.person.at(0) === '+') {
            user.person = user.person.substring(0, 3) + "********" + user.person.at(user.person.length-1);
        } else {
            let person = user.person.split("@")
            user.person = person[0].at(0) + "*****" + person[0].at(person[0].length-1) + "@" + person[1];
        }
    }
    return {
        auth: locals.user !== null,
        user: user,
        session: locals.session
    }
}