from odoo import models, fields, api


class TreatmentData(models.Model):
    _name = 'treatment.data'
    _description = 'Treatment Data Model'

    treatment_id = fields.Many2one('dentist.treatment', string='Treatment', ondelete='cascade')
    patient_id = fields.Char(string='Patient ')
    tooth_id = fields.Char(string='Tooth ID')
    universal_number = fields.Char(string='Universal Number')
    selected_teeth = fields.Text(string='Selected Teeth')
    status = fields.Char(string='Status')
    procedure = fields.Char(string='Procedure')
    cost = fields.Float(string='Cost')
    currency_id = fields.Many2one('res.currency', string='Currency', default=lambda self: self.env.ref('base.TND').id,
                                  readonly=True)

    @api.model
    def get_total_revenue(self):
        total_revenue = sum(self.search([]).mapped('cost'))
        company_currency = self.env.company.currency_id
        return f"{total_revenue} {company_currency.name}"

    @api.model
    def get_revenue_breakdown(self, time_frame=None):
        result = {}

        # Modify the query to consider the time frame
        query = """
            SELECT 
                CASE 
                    WHEN '{}' = 'daily' THEN TO_CHAR(create_date, 'YYYY-MM-DD HH24:MI:SS')
                    ELSE TO_CHAR(create_date, 'YYYY-MM-DD')
                END AS datetime,
                SUM(cost) AS revenue
            FROM 
                treatment_data 
        """.format(time_frame)

        try:
            if time_frame == 'monthly':
                # Filter data for the current month
                query += "WHERE TO_CHAR(create_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')"
            elif time_frame == 'yearly':
                # Filter data for the current year
                query += "WHERE TO_CHAR(create_date, 'YYYY') = TO_CHAR(CURRENT_DATE, 'YYYY')"
            elif time_frame == 'weekly':
                # Filter data for the current week
                query += "WHERE TO_CHAR(create_date, 'IYYY-IW') = TO_CHAR(CURRENT_DATE, 'IYYY-IW')"
            elif time_frame == 'daily':
                # Filter data for the current day
                query += "WHERE TO_CHAR(create_date, 'YYYY-MM-DD') = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')"
            query += """
                GROUP BY 
                    CASE 
                        WHEN '{}' = 'daily' THEN TO_CHAR(create_date, 'YYYY-MM-DD HH24:MI:SS')
                        ELSE TO_CHAR(create_date, 'YYYY-MM-DD')
                    END
                ORDER BY 
                    CASE 
                        WHEN '{}' = 'daily' THEN TO_CHAR(create_date, 'YYYY-MM-DD HH24:MI:SS')
                        ELSE TO_CHAR(create_date, 'YYYY-MM-DD')
                    END;
            """.format(time_frame, time_frame)

            # Execute the modified query
            self._cr.execute(query)

            for row in self._cr.fetchall():
                datetime, revenue = row
                result[datetime] = revenue

        except Exception as e:
            # Handle exceptions (log or raise)
            raise UserError(f"Error fetching revenue breakdown: {e}")

        return result

    @api.model
    def get_revenue_breakdown_with_currency(self, time_frame=None):
        result = {}
        currency = self.env.company.currency_id.name

        # Fetch revenue breakdown data
        result['revenue_data'] = self.get_revenue_breakdown(time_frame)
        result['currency'] = currency

        return result
