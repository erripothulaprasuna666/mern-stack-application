// Runs when no route matches
const notFound = (req, res, next) => {
 res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};
// Handles every error in one place (must have 4 parameters)
const errorHandler = (err, req, res, next) => {
 let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
 let message = err.message || "Server error";
 if (err.name === "CastError") {
 status = 400;
 message = "Invalid ID format";
 }
 if (err.name === "ValidationError") {
 status = 400;
 message = Object.values(err.errors).map((e) => e.message).join(", ");
 }
 if (err.code === 11000) {
 status = 400;
 message = "Duplicate value: this email is already registered";
 }
 res.status(status).json({ message });
};
module.exports = { notFound, errorHandler };
