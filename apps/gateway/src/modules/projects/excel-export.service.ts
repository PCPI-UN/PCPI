import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  ProjectComplete,
  PendingProjectParticipant,
} from '@app/common/generated/project';
import { Course } from '@app/common/generated/event';
import { GetProjectStatsResponse } from '@app/common/generated/evaluation';

interface ProjectWithStats {
  project: ProjectComplete;
  stats: GetProjectStatsResponse;
  course: Course;
}

@Injectable()
export class ExcelExportService {
  private readonly logger = new Logger(ExcelExportService.name);

  /**
   * Creates an Excel workbook with projects grouped by course
   * Each sheet represents one course/career
   */
  async createProjectsExcelWorkbook(
    projectsWithStats: ProjectWithStats[],
  ): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'Iris Platform';
    workbook.lastModifiedBy = 'Iris Platform';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Group projects by courseId
    const projectsByCourse = this.groupProjectsByCourse(projectsWithStats);

    // Create a sheet for each course
    for (const [courseId, projects] of projectsByCourse.entries()) {
      if (projects.length === 0) continue;

      const courseName = projects[0].course.code || `Course ${courseId}`;
      const sheet = workbook.addWorksheet(courseName, {
        properties: { tabColor: { argb: 'FF0066CC' } },
      });

      this.createSheetHeaders(sheet);
      this.populateSheetData(sheet, projects);
      this.formatSheet(sheet);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  /**
   * Groups projects by courseId
   */
  private groupProjectsByCourse(
    projectsWithStats: ProjectWithStats[],
  ): Map<number, ProjectWithStats[]> {
    const grouped = new Map<number, ProjectWithStats[]>();

    for (const item of projectsWithStats) {
      const courseId = item.project.courseId;
      if (!grouped.has(courseId)) {
        grouped.set(courseId, []);
      }
      grouped.get(courseId)!.push(item);
    }

    return grouped;
  }

  /**
   * Creates column headers for the sheet
   */
  private createSheetHeaders(sheet: ExcelJS.Worksheet): void {
    sheet.columns = [
      { header: 'Nombre del Proyecto', key: 'projectName', width: 30 },
      { header: 'Participantes', key: 'participants', width: 50 },
      { header: 'Número de Evaluaciones', key: 'evaluationCount', width: 25 },
      { header: 'Nota Final', key: 'finalGrade', width: 15 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  /**
   * Populates sheet with project data
   */
  private populateSheetData(
    sheet: ExcelJS.Worksheet,
    projects: ProjectWithStats[],
  ): void {
    // First pass: collect all unique categories across all projects
    const allCategories = new Set<string>();
    projects.forEach((item) => {
      item.stats.categoryStats.forEach((cat) =>
        allCategories.add(cat.category),
      );
    });

    const categoryArray = Array.from(allCategories).sort();

    // Add category columns to headers
    const headerRow = sheet.getRow(1);
    let colIndex = 5; // Start after base columns
    categoryArray.forEach((category) => {
      sheet.getColumn(colIndex).header = category;
      sheet.getColumn(colIndex).width = 20;
      sheet.getColumn(colIndex).key = `category_${category}`;

      const cell = headerRow.getCell(colIndex);
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0066CC' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };

      colIndex++;
    });

    // Add comments column
    sheet.getColumn(colIndex).header = 'Comentarios';
    sheet.getColumn(colIndex).width = 60;
    sheet.getColumn(colIndex).key = 'comments';
    const commentsCell = headerRow.getCell(colIndex);
    commentsCell.font = { bold: true, size: 12 };
    commentsCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' },
    };
    commentsCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Populate rows
    projects.forEach((item, index) => {
      const row = sheet.getRow(index + 2); // +2 because row 1 is headers

      // Project Name
      row.getCell(1).value = item.project.name;

      // Participants (comma-separated)
      const participantsText = this.formatParticipants(
        item.project.pendingParticipants,
      );
      row.getCell(2).value = participantsText;

      // Number of Evaluations
      row.getCell(3).value = item.stats.evaluationCount;

      // Final Grade
      row.getCell(4).value = item.stats.averageGrade.toFixed(2);

      // Category grades
      const categoryMap = new Map(
        item.stats.categoryStats.map((cat) => [cat.category, cat.averageScore]),
      );

      colIndex = 5;
      categoryArray.forEach((category) => {
        const score = categoryMap.get(category);
        row.getCell(colIndex).value =
          score !== undefined ? score.toFixed(2) : 'N/A';
        colIndex++;
      });

      // Comments (formatted)
      const commentsText = this.formatComments(item.stats.comments);
      row.getCell(colIndex).value = commentsText;

      // Style data row
      row.alignment = { vertical: 'top', wrapText: true };
    });
  }

  /**
   * Formats pending participants into comma-separated string
   */
  private formatParticipants(
    participants: PendingProjectParticipant[],
  ): string {
    if (!participants || participants.length === 0) {
      return 'Sin participantes';
    }

    return participants
      .map((p) => {
        const name = `${p.firstName} ${p.lastName || ''}`.trim();
        const email = p.email;
        const code = p.studentCode;
        return `${name} (${email}, ${code})`;
      })
      .join(', ');
  }

  /**
   * Formats comments into numbered list
   * Format: "Comentario #1: [text] | Comentario #2: [text] | ..."
   */
  private formatComments(comments: string[]): string {
    if (!comments || comments.length === 0) {
      return 'Sin comentarios';
    }

    return comments
      .map((comment, index) => `Comentario #${index + 1}: ${comment}`)
      .join(' | ');
  }

  /**
   * Applies formatting to the entire sheet
   */
  private formatSheet(sheet: ExcelJS.Worksheet): void {
    // Add borders to all cells
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Freeze first row (headers)
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }
}
