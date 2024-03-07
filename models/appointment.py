from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import timedelta, datetime


class DentistAppointment(models.Model):
    _name = 'dentist.appointment'
    _description = 'Dentist Appointment'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Appointment Reference', required=True, copy=False, readonly=True, index=True,
                       default=lambda self: self.env['ir.sequence'].next_by_code('dentist.appointment') or '/')
    appointment_type = fields.Selection([
        ('checkup', 'Checkup'),
        ('cleaning', 'Cleaning'),
        ('extraction', 'Tooth Extraction'),
        ('whitening', 'Teeth Whitening'),
        ('other', 'Other')],
        string='Appointment Type', track_visibility='onchange')
    appointment_date = fields.Datetime(string='Appointment Date', required=True, track_visibility='onchange')
    appointment_end_date = fields.Datetime(string='Appointment End Date', store=True, track_visibility='onchange')
    patient_id = fields.Many2one('dentist.patient', string='Patient', required=True, track_visibility='onchange',
                                 ondelete='cascade')
    doctor_id = fields.Many2one('res.users', string='Assigned Doctor', track_visibility='onchange')
    notes = fields.Text(string='Notes', track_visibility='onchange')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled')],
        string='Status', default='draft', track_visibility='onchange')

    @api.model
    def get_patient_appointments(self, patient_id):
        """
        Fetch appointments related to a specific patient.

        :param patient_id: ID or other identifier of the patient
        :return: List of dictionaries containing appointment data
        """
        appointments = self.search([('patient_id', '=', patient_id)])

        # You may need to customize this logic based on your actual data model
        appointments_data = [{'date': appointment.appointment_date, 'count': 1} for appointment in appointments]

        return appointments_data

    # Constraint to check appointment date and end date
    @api.constrains('appointment_date', 'appointment_end_date')
    def _check_appointment_dates(self):
        for rec in self:
            if rec.appointment_date >= rec.appointment_end_date:
                raise ValidationError(
                    'The appointment end date cannot be earlier than or equal to the appointment start date.')
            if (rec.appointment_end_date - rec.appointment_date).total_seconds() / 60 < 30:
                raise ValidationError(
                    'The minimum duration between appointment start date and end date should be 30 minutes.')

            # Check if there are existing appointments within the selected date range
            existing_appointments = self.search([
                ('appointment_date', '<=', rec.appointment_end_date),
                ('appointment_end_date', '>=', rec.appointment_date),
                ('id', '!=', rec.id)
            ])
            if existing_appointments:
                raise ValidationError('There are existing appointments within the selected date range.')

    @api.onchange('appointment_date')
    def _onchange_appointment_date(self):
        if self.appointment_date:
            self.appointment_end_date = self.appointment_date + timedelta(minutes=30)

    @api.model
    def get_today_appointments(self):
        # Calculate the start of today
        today_start = datetime.combine(fields.Date.today(), datetime.min.time())

        # Calculate the end of today (with microsecond precision)
        today_end = datetime.combine(fields.Date.today(), datetime.max.time())

        # Fetch appointments within the date range, with specified conditions
        appointments = self.search([
            ('appointment_date', '>=', today_start),
            ('appointment_date', '<=', today_end),
            ('state', 'in', ['draft', 'confirmed', 'done', 'cancelled']),
            ('name', '!=', '/'),
        ])

        # Extract relevant information for each appointment
        appointments_data = []
        for appointment in appointments:
            appointment_data = {
                'id': appointment.id,
                'name': appointment.name,
                'appointment_date': appointment.appointment_date,
                'state': appointment.state,
                # Add more fields as needed
            }
            appointments_data.append(appointment_data)

        return appointments_data

    # Define a sequence for the appointment reference
    @api.model
    def create(self, vals):
        if vals.get('name', '/') == '/':
            vals['name'] = self.env['ir.sequence'].next_by_code('dentist.appointment') or '/'
        return super(DentistAppointment, self).create(vals)
