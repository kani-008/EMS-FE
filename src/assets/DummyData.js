// frontend/src/student/assets/DummyData.js
/*************************************
 * CONFIG
 *************************************/
const TOTAL_USERS = 500; // 🔁 change to 200 anytime
const ACTIVE_RATIO = 0.5; // 50% active users

/*************************************
 * USERS (MASTER DATA)
 *************************************/
export const DummyData = Array.from(
  { length: TOTAL_USERS },
  (_, i) => {
    const isActive = i < TOTAL_USERS * ACTIVE_RATIO;

    return {
      userId: `24CSE${String(i + 1).padStart(3, "0")}`,
      userName: `User ${i + 1}`,
      course: i % 2 === 0 ? "B.E" : "M.E",
      department:
        i % 3 === 0 ? "CSE" : i % 3 === 1 ? "ECE" : "MECH",
      year: (i % 4) + 1,
      registrationNo: `731124405${String(i + 10).padStart(3, "0")}`,
      batch: i < TOTAL_USERS / 2 ? "2021" : "2022",
      status: isActive ? "Active" : "Inactive",
      userRole: "Student",
      timestamp: "19 Mar 2023 22:18:10",
    };
  }
);

/*************************************
 * REQUESTS (TRANSACTION DATA)
 * ONLY Active users can create requests
 *************************************/
const activeUsers = DummyData.filter(
  (u) => u.status === "Active"
);

const categories = ["Leave", "Paper Presentation", "Sports"];
const statuses = ["Pending", "Accepted", "Rejected"];

// 🔧 requests scale automatically
export const DummyRequests = Array.from(
  { length: TOTAL_USERS * 2 },
  (_, i) => {
    const user = activeUsers[i % activeUsers.length];

    return {
      reqId: `RID${1000 + i}`,
      requestFrom: user.userName,
      course: user.course,
      department: user.department,
      year: user.year,
      requestTo: "Angamuthu G",
      requestCategory: categories[i % categories.length],
      status: statuses[i % statuses.length],
      timestamp: "19 Mar 2023 22:18:10",
    };
  }
);
