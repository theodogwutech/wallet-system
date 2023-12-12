
# SECTION 2

## Explain the problem of “racing condition” and how it affects the integrity of a database.

In a database, multiple operations (like reading, updating, or deleting data) can happen at the same time from different parts of an application. If not managed carefully, these operations might conflict and lead to unexpected or incorrect results. This unpredictability in the order of operations is the racing condition.


## Give a practical fintech example where “racing” can leads to loss of money.

Consider a situation where two users, Ngozi and Chijioke, simultaneously initiate transactions to pay a vendor ₦500 each for a limited-stock item. Due to a race condition, both transactions might pass the available balance check simultaneously, deducting ₦500 from each user's account. This can result in both Ngozi and Chijioke believing their payments were successful, leading to a financial loss for one user when the system later identifies the conflicting transactions during reconciliation. To prevent such issues, payment platforms must implement robust concurrency controls and transaction handling to ensure accurate and fair processing of user payments.


## Profer one practical solution to fix it .

There are several steps that can be taken to prevent Race condition

 - **Database Transactions**: Wrapping the balance check and deduction operations within a single database transaction. This ensures that either both operations succeed or fail together, maintaining atomicity.
 - **Retrying**: If a transaction fails due to a conflict, the system can notify the user and prompt them to retry the transaction.
 - **Rolling Back**: If a conflict is detected during the transaction (e.g., two users trying to purchase the same limited-stock item simultaneously), the system should roll back the transaction to its initial state, ensuring that no changes are persisted.


# Section 3: Algorithm Assessment

## Given a square matrix, calculate the absolute difference between the sums of its diagonals.

```javascript
function diagonalDifference(matrix) {
    let d = 0, r = 0;
    matrix.forEach((row, i) => d += row[i], r += row[matrix.length - i - 1]);
    return Math.abs(d - r);
}

const n = parseInt(readline());
const matrix = Array.from({ length: n }, () => readline().split(' ').map(Number));

console.log(diagonalDifference(matrix));