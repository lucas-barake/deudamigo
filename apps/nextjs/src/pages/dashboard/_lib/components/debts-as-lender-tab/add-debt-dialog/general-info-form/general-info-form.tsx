import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "$/components/ui/form";
import { Button } from "$/components/ui/button";
import { ArrowRight, DivideIcon, EyeIcon } from "lucide-react";
import { DatePicker } from "$/components/ui/date-picker";
import { DateTime } from "luxon";
import { CurrencyInput } from "$/components/ui/currency-input";
import { type TabSetters } from "$/lib/hooks/use-tabs";
import { type addDebtTabs } from "$/pages/dashboard/_lib/components/debts-as-lender-tab/add-debt-dialog/(component-lib)/add-debt-tabs";
import {
  type CreateDebtInput,
  createDebtRecurrentOptions,
  createDebtTypeOptions,
  CURRENCIES,
  DEBT_MAX_BIWEEKLY_DURATION,
  DEBT_MAX_MONTHLY_DURATION,
  DEBT_MAX_WEEKLY_DURATION,
  generalInfoInput,
  type GeneralInfoInput,
} from "@deudamigo/ts-rest";
import RecurringCyclesDialog from "$/pages/dashboard/_lib/components/recurring-cycles-dialog";

function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

type Props = {
  tabSetters: TabSetters<typeof addDebtTabs>;
  formData: CreateDebtInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateDebtInput>>;
};

const GeneralInfoForm: React.FC<Props> = ({ tabSetters, setFormData, formData }) => {
  const [openCyclesInfo, setOpenCyclesInfo] = React.useState(false);

  const form = useForm<GeneralInfoInput>({
    defaultValues: formData.generalInfo,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(generalInfoInput),
  });
  const isRecurrent = form.watch("type") === "RECURRENT";

  function handleSubmit(data: GeneralInfoInput): void {
    setFormData((prev) => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        name: data.name,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        recurrency: isRecurrent ? data.recurrency : null,
        dueDate: isRecurrent ? null : data.dueDate,
        type: data.type,
      },
    }));
    tabSetters.next();
  }

  return (
    <React.Fragment>
      {isRecurrent && (
        <RecurringCyclesDialog
          open={openCyclesInfo}
          onOpenChange={setOpenCyclesInfo}
          recurringFrequency={form.watch("recurrency.frequency")!}
          duration={form.watch("recurrency.duration")!}
          createdAt={DateTime.now().plus({ minute: 1 }).toJSDate()}
        />
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises*/}
      <Form onSubmit={form.handleSubmit(handleSubmit)}>
        <Form.Group>
          <Form.Label htmlFor="name" required>
            Nombre
          </Form.Label>
          <Form.Input
            id="name"
            {...form.register("name")}
            required
            error={form.formState.errors.name !== undefined}
          />

          <Form.FieldError>{form.formState.errors.name?.message}</Form.FieldError>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="type" required>
            Tipo
          </Form.Label>

          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Form.Select defaultValue={field.value} onValueChange={field.onChange}>
                <Form.Select.Trigger className="h-full">
                  <Form.Select.Value placeholder="Seleccione una opción" />
                </Form.Select.Trigger>

                <Form.Select.Content align="end">
                  {createDebtTypeOptions.map((option) => (
                    <Form.Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Form.Select.Item>
                  ))}
                </Form.Select.Content>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group>
          <div className="flex items-center gap-3">
            <Form.Label htmlFor="amount" required>
              Cantidad
            </Form.Label>

            {isRecurrent && (
              <Button
                className="self-start text-sm"
                variant="success"
                onClick={() => {
                  form.setValue(
                    "amount",
                    roundToTwoDecimals(form.watch("amount") / form.watch("recurrency.duration")!)
                  );
                }}
                size="sm">
                <DivideIcon className="mr-1.5 h-4 w-4" />
                Dividir en periodos
              </Button>
            )}
          </div>

          <div className="flex gap-1">
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <CurrencyInput
                  currency={form.watch("currency")}
                  value={field.value}
                  onChange={(args) => {
                    field.onChange(args.value);
                  }}
                />
              )}
            />

            <Controller
              name="currency"
              control={form.control}
              render={({ field }) => (
                <Form.Select defaultValue={field.value} onValueChange={field.onChange}>
                  <Form.Select.Trigger className="h-full w-24">
                    <Form.Select.Value placeholder="Seleccione una opción" />
                  </Form.Select.Trigger>

                  <Form.Select.Content align="end">
                    {CURRENCIES.map((value) => (
                      <Form.Select.Item key={value} value={value}>
                        {value}
                      </Form.Select.Item>
                    ))}
                  </Form.Select.Content>
                </Form.Select>
              )}
            />
          </div>

          <Form.FieldError>{form.formState.errors.amount?.message}</Form.FieldError>
        </Form.Group>

        {!isRecurrent && (
          <Form.Group>
            <Form.Label htmlFor="dueDate">Fecha de vencimiento</Form.Label>

            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? undefined}
                  onChange={(date) => {
                    if (date === undefined) {
                      field.onChange(null);
                      return;
                    }
                    field.onChange(DateTime.fromJSDate(date).toUTC().toISO());
                  }}
                  disabled={{
                    before: DateTime.now().plus({ day: 1 }).toJSDate(),
                  }}
                />
              )}
            />

            <Form.FieldError>{form.formState.errors.dueDate?.message}</Form.FieldError>
          </Form.Group>
        )}

        <Form.Group>
          <Form.Label htmlFor="description">Descripción</Form.Label>
          <Form.TextArea id="description" {...form.register("description")} />

          <Form.FieldError>{form.formState.errors.description?.message}</Form.FieldError>
        </Form.Group>

        {isRecurrent && (
          <React.Fragment>
            <Form.Group>
              <Form.Label htmlFor="recurrentFrequency" required>
                Frecuencia
              </Form.Label>

              <Controller
                name="recurrency.frequency"
                control={form.control}
                render={({ field }) => (
                  <Form.Select
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("recurrency.duration", 2);
                    }}>
                    <Form.Select.Trigger>
                      <Form.Select.Value placeholder="Seleccione una opción" />
                    </Form.Select.Trigger>

                    <Form.Select.Content>
                      {createDebtRecurrentOptions.map((option) => (
                        <Form.Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Form.Select.Item>
                      ))}
                    </Form.Select.Content>
                  </Form.Select>
                )}
              />

              <Form.FieldError>
                {form.formState.errors.recurrency?.frequency?.message}
              </Form.FieldError>
            </Form.Group>

            <Form.Group>
              <Form.Label htmlFor="recurrentDuration" required>
                Duración
              </Form.Label>

              <Controller
                name="recurrency.duration"
                control={form.control}
                render={({ field }) => {
                  const frequency = form.watch("recurrency.frequency");
                  const startValue = 2;

                  return (
                    <Form.Select defaultValue={String(field.value)} onValueChange={field.onChange}>
                      <Form.Select.Trigger>
                        <Form.Select.Value placeholder="Seleccione una opción" />
                      </Form.Select.Trigger>

                      <Form.Select.Content>
                        {frequency === "WEEKLY" &&
                          Array.from({
                            length: DEBT_MAX_WEEKLY_DURATION - startValue + 1,
                          }).map((_, index) => (
                            <Form.Select.Item key={index} value={String(index + startValue)}>
                              {`${index + startValue} semanas`}
                            </Form.Select.Item>
                          ))}

                        {frequency === "BIWEEKLY" &&
                          Array.from({
                            length: DEBT_MAX_BIWEEKLY_DURATION - startValue + 1,
                          }).map((_, index) => (
                            <Form.Select.Item key={index} value={String(index + startValue)}>
                              {`${index + startValue} quincenas`}
                            </Form.Select.Item>
                          ))}

                        {frequency === "MONTHLY" &&
                          Array.from({
                            length: DEBT_MAX_MONTHLY_DURATION - startValue + 1,
                          }).map((_, index) => (
                            <Form.Select.Item key={index} value={String(index + startValue)}>
                              {`${index + startValue} meses`}
                            </Form.Select.Item>
                          ))}
                      </Form.Select.Content>
                    </Form.Select>
                  );
                }}
              />

              <Form.FieldError>
                {form.formState.errors.recurrency?.duration?.message}
              </Form.FieldError>
            </Form.Group>
          </React.Fragment>
        )}

        {isRecurrent && (
          <Button
            className="flex items-center justify-center gap-2 self-start py-2"
            variant="outline"
            onClick={() => {
              setOpenCyclesInfo(true);
            }}>
            <EyeIcon className="h-5 w-5" />
            Ver periodos
          </Button>
        )}

        <Button type="submit" className="mt-4 flex flex-1 items-center justify-center py-2">
          Siguiente
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Form>
    </React.Fragment>
  );
};

export default GeneralInfoForm;
