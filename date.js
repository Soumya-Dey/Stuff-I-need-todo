exports.getDate = () => {
    const today = new Date();

    return today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
};
