from odoo import models, fields, api


class DentistAppointment(models.Model):
    _name = 'dentist.appointment'
    _description = 'Dentist Appointment'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    # Basic Appointment Information
    name = fields.Char(string='Appointment Reference', required=True, copy=False, readonly=True, index=True, default=lambda self: self.env['ir.sequence'].next_by_code('dentist.appointment') or '/')

    appointment_type = fields.Selection([
        ('checkup', 'Checkup'),
        ('cleaning', 'Cleaning'),
        ('extraction', 'Tooth Extraction'),
        ('whitening', 'Teeth Whitening'),
        ('other', 'Other')],
        string='Appointment Type', track_visibility='onchange')

    appointment_date = fields.Datetime(string='Appointment Date', required=True, track_visibility='onchange')
    appointment_end_date = fields.Datetime(string='Appointment End Date', required=True, track_visibility='onchange')

    # Linked Patient Information
    patient_id = fields.Many2one('dentist.patient', string='Patient', required=True, track_visibility='onchange')

    # Assigned Doctor
    doctor_id = fields.Many2one('res.users', string='Assigned Doctor', track_visibility='onchange')

    # Assigned Room

    # Additional Information
    notes = fields.Text(string='Notes', track_visibility='onchange')

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled')],
        string='Status', default='draft', track_visibility='onchange')





    # Confirm the appointment
    def action_confirm(self):
        self.write({'state': 'confirmed'})
    # Mark the appointment as done
    def action_done(self):
        self.write({'state': 'done'})
    # Cancel the appointment
    def action_cancel(self):
        self.write({'state': 'cancelled'})
    # Reset the appointment to draft
    def action_draft(self):
        self.write({'state': 'draft'})



    # Define a sequence for the appointment reference
    @api.model
    def create(self, vals):
        if vals.get('name', '/') == '/':
            vals['name'] = self.env['ir.sequence'].next_by_code('dentist.appointment') or '/'
        return super(DentistAppointment, self).create(vals)

    # @api.constrains('appointment_date', 'appointment_end_date')
    # def _check_appointment_date(self):
    #     for rec in self:
    #         if rec.appointment_date >= rec.appointment_end_date:
    #             raise ValidationError('The appointment end date cannot be earlier than the appointment start date.')
