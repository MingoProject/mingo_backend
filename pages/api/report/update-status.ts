// // pages/api/report/updateStatus.ts
// import { updateReportStatus } from "@/lib/actions/report.action"; // Import logic cập nhật báo cáo
// import type { NextApiRequest, NextApiResponse } from "next";
// import corsMiddleware, {
//   authenticateToken,
// } from "@/middleware/auth-middleware"; // Middleware xác thực token người dùng

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   corsMiddleware(req, res, async () => {
//     if (req.method === "PATCH") {
//       try {
//         const { reportId, status } = req.body;

//         // Kiểm tra nếu user đã đăng nhập và có id
//         if (!req.user?.id) {
//           return res
//             .status(401)
//             .json({ message: "User is not authenticated." });
//         }

//         // Xác thực input
//         if (!reportId || ![1, 2].includes(status)) {
//           return res.status(400).json({
//             message:
//               "Invalid request. Ensure 'reportId' and 'status' are provided.",
//           });
//         }

//         // Gọi action để cập nhật trạng thái báo cáo
//         const updatedReport = await updateReportStatus(
//           reportId,
//           status,
//           req.user.id // ID của người thực hiện cập nhật
//         );

//         return res.status(200).json(updatedReport);
//       } catch (error) {
//         console.error("Error updating report status:", error);

//         if (error instanceof Error) {
//           return res.status(400).json({ message: error.message });
//         }
//         return res
//           .status(500)
//           .json({ message: "An unexpected error occurred." });
//       }
//     } else {
//       return res.status(405).json({ message: "Method Not Allowed" });
//     }
//   });
// }

// pages/api/report/updateStatus.ts
import { updateReportStatus } from "@/lib/actions/report.action"; // Import logic cập nhật báo cáo
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware"; // Middleware xác thực token người dùng

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    if (req.method === "PATCH") {
      try {
        const { reportId, status } = req.body;

        // // Kiểm tra nếu user đã đăng nhập và có id
        // if (!req.user?.id) {
        //   return res
        //     .status(401)
        //     .json({ message: "User is not authenticated." });
        // }

        // Xác thực input
        if (!reportId || ![1, 2].includes(status)) {
          return res.status(400).json({
            message:
              "Invalid request. Ensure 'reportId' and 'status' are provided.",
          });
        }

        // Gọi action để cập nhật trạng thái báo cáo
        const updatedReport = await updateReportStatus(reportId, status);

        return res.status(200).json(updatedReport);
      } catch (error) {
        console.error("Error updating report status:", error);

        if (error instanceof Error) {
          return res.status(400).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "An unexpected error occurred." });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
